import { lookup } from "node:dns";
import { isIP } from "node:net";
import http from "node:http";
import https from "node:https";
import type { IncomingMessage } from "node:http";
import type { LookupFunction } from "node:net";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Fetches an image from a web address for the admin's "Image address" option. Browsers block most
 * sites from being read directly (CORS), so the admin asks this route on its own site instead.
 *
 * Guarded so it cannot be used to reach private machines or as a general proxy:
 * same-site requests only, http(s) on standard ports, every resolved address must be public
 * (checked at connect time, so DNS tricks do not get through), images only, size and time limits.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

class FetchError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

/** Loopback, private, link-local, carrier-grade NAT, metadata and other non-public ranges. */
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
  }
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateAddress(mapped[1]);
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb") || v6.startsWith("ff");
}

/** DNS lookup that refuses non-public addresses; used by the socket itself, so it cannot be bypassed. */
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 4);
    const list = addresses as { address: string; family: number }[];
    const bad = !list.length || list.some((a) => isPrivateAddress(a.address));
    if (bad) return callback(new FetchError("That address points to a private network."), "", 4);
    if ((options as { all?: boolean }).all) return (callback as unknown as (e: null, a: typeof list) => void)(null, list);
    callback(null, list[0].address, list[0].family);
  });
};

function parseTarget(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchError("That is not a valid web address.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new FetchError("Use an http:// or https:// address.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new FetchError("That address uses an unusual port.");
  if (url.username || url.password) throw new FetchError("Addresses with a login are not supported.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && isPrivateAddress(host)) throw new FetchError("That address points to a private network.");
  return url;
}

function get(url: URL): Promise<IncomingMessage> {
  const client = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(url, { lookup: publicOnlyLookup, timeout: TIMEOUT_MS, headers: { "user-agent": "GadirideAdmin/1.0 (image import)", accept: "image/*" } }, resolve);
    req.on("timeout", () => req.destroy(new FetchError("The image took too long to download.", 504)));
    req.on("error", reject);
  });
}

async function readImage(res: IncomingMessage): Promise<{ body: Buffer; type: string }> {
  const type = String(res.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
  if (!type.startsWith("image/")) {
    res.resume();
    throw new FetchError("That address is not an image. Right-click the image and choose “Copy image address”.");
  }
  if (Number(res.headers["content-length"] ?? 0) > MAX_BYTES) {
    res.resume();
    throw new FetchError("That image is larger than 25 MB.", 413);
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of res) {
    size += (chunk as Buffer).length;
    if (size > MAX_BYTES) {
      res.destroy();
      throw new FetchError("That image is larger than 25 MB.", 413);
    }
    chunks.push(chunk as Buffer);
  }
  return { body: Buffer.concat(chunks), type };
}

async function fetchImage(raw: string): Promise<{ body: Buffer; type: string }> {
  let url = parseTarget(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await get(url);
    const status = res.statusCode ?? 0;
    if (status >= 300 && status < 400 && res.headers.location) {
      res.resume();
      url = parseTarget(new URL(res.headers.location, url).toString());
      continue;
    }
    if (status !== 200) {
      res.resume();
      throw new FetchError(`The site answered with an error (${status}).`, 502);
    }
    return readImage(res);
  }
  throw new FetchError("Too many redirects.", 502);
}

export async function GET(req: NextRequest) {
  // Only the admin on this same site may use it (browsers set this header; other sites cannot fake it).
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return NextResponse.json({ message: "Not allowed." }, { status: 403 });
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return NextResponse.json({ message: "Add an image address." }, { status: 400 });
  try {
    const { body, type } = await fetchImage(raw);
    return new NextResponse(new Uint8Array(body), {
      headers: { "content-type": type, "content-length": String(body.length), "cache-control": "no-store", "x-content-type-options": "nosniff" },
    });
  } catch (err) {
    const known = err instanceof FetchError;
    const message = known ? err.message : "Could not download that image. Check the address, or download it and upload the file instead.";
    console.error("[image-from-url]", raw, (err as Error).message);
    return NextResponse.json({ message }, { status: known ? err.status : 502 });
  }
}
