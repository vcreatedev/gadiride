import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_TAG } from "@/lib/content";

/**
 * Sanity webhook target. Publishing in the admin refreshes the site instantly
 * instead of waiting for the 60s cache. Set SANITY_REVALIDATE_SECRET and add a
 * webhook in sanity.io/manage pointing at https://<your-domain>/api/revalidate.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
    if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    revalidateTag(SANITY_TAG);
    return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
