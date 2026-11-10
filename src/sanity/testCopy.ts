"use client";
/**
 * The dev admin's test copy (dataset "development"; see `testOverlay` in env.ts).
 *
 * The dev admin shows the live content (production) and stores only what is edited here:
 *   - Lists and the overview read development + the live documents development has not touched
 *     (`mergedFetch`), run through the same GROQ locally.
 *   - A live document opened here is shown filled with its live content and stored only on the
 *     first edit (`liveInitialValue`, used by the "live-copy-*" templates).
 *   - List actions (eye, reorder) on a live item first store a copy of just that item (`liveCopies`).
 * Copies bring the photos they use (asset records do not count toward the document quota) and keep
 * links to other live documents as weak references, so nothing else is copied. An hourly job deletes
 * test edits after an hour (scripts/clean-dev-test-edits.mjs).
 *
 * The live dataset is only read: `liveReader` exposes `fetch` and nothing else.
 */
import { getPublishedId, type SanityClient, type SanityDocument } from "sanity";
import { evaluate, parse } from "groq-js";
import { LIVE_DATASET, apiVersion } from "./env";

type Doc = Record<string, unknown> & { _id: string; _type: string };
type Reader = { fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T> };

/** Read-only access to the live content: there is no way to write through this. */
export function liveReader(client: SanityClient): Reader {
  const live = client.withConfig({ apiVersion, dataset: LIVE_DATASET, perspective: "published", useCdn: false });
  return { fetch: (query, params = {}) => live.fetch(query, params) };
}

const NOT_SYSTEM = `!(_id in path("_.**"))`;
const LIVE_DOCS = `*[${NOT_SYSTEM} && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]`;
const isAssetId = (id: string) => /^(image|file)-/.test(id);

/** Short-lived cache so several panes opening together read the live content once. */
let liveCache: { at: number; docs: Promise<Doc[]> } | null = null;
const LIVE_CACHE_MS = 5000;
function liveDocs(client: SanityClient): Promise<Doc[]> {
  if (!liveCache || Date.now() - liveCache.at > LIVE_CACHE_MS) {
    liveCache = { at: Date.now(), docs: liveReader(client).fetch<Doc[]>(LIVE_DOCS) };
  }
  return liveCache.docs;
}

/**
 * Runs `query` over the test copy's documents (drafts included) plus every live document the test
 * copy has not touched. Live documents carry `_live: true`, so a projection can tell them apart.
 */
export async function mergedFetch<T>(client: SanityClient, query: string, params: Record<string, unknown> = {}): Promise<T> {
  const [test, live] = await Promise.all([client.fetch<Doc[]>(`*[${NOT_SYSTEM}]`), liveDocs(client)]);
  const touched = new Set<string>(test.map((d) => getPublishedId(d._id)));
  const docs = [...test, ...live.filter((d) => !touched.has(d._id)).map((d) => ({ ...d, _live: true }))];
  return (await (await evaluate(parse(query), { dataset: docs, params })).get()) as T;
}

/** Every `{_ref}` in a document, with the object holding it (to rewrite or weaken it). */
function collectRefs(value: unknown, out: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) value.forEach((v) => collectRefs(v, out));
  else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj._ref === "string") out.push(obj);
    Object.values(obj).forEach((v) => collectRefs(v, out));
  }
  return out;
}

/** Uploads the live photos a copy uses into the test copy; returns old id → new id where they differ. */
async function copyPhotos(client: SanityClient, live: Reader, ids: string[]): Promise<Map<string, string>> {
  const renamed = new Map<string, string>();
  if (!ids.length) return renamed;
  const have = new Set(await client.fetch<string[]>(`*[_id in $ids]._id`, { ids }));
  const missing = ids.filter((id) => !have.has(id));
  if (!missing.length) return renamed;
  const assets = await live.fetch<{ _id: string; _type: string; url: string; originalFilename?: string; mimeType?: string }[]>(
    `*[_id in $ids]{_id, _type, url, originalFilename, mimeType}`,
    { ids: missing },
  );
  for (const a of assets) {
    const file = await fetch(a.url);
    if (!file.ok) throw new Error(`Could not copy the photo ${a.originalFilename ?? a._id} (${file.status}).`);
    const uploaded = await client.assets.upload(a._type === "sanity.fileAsset" ? "file" : "image", await file.blob(), {
      filename: a.originalFilename,
      contentType: a.mimeType,
    });
    if (uploaded._id !== a._id) renamed.set(a._id, uploaded._id);
  }
  return renamed;
}

/** A live document made ready to store in the test copy: photos copied, other links kept weak. */
async function prepare(client: SanityClient, live: Reader, doc: Doc): Promise<Doc> {
  const { _rev: _r, _updatedAt: _u, _createdAt: _c, ...copy } = structuredClone(doc);
  const refs = collectRefs(copy);
  const ids = [...new Set(refs.map((r) => r._ref as string))];
  const renamed = await copyPhotos(client, live, ids.filter(isAssetId));
  const docIds = ids.filter((id) => !isAssetId(id));
  const inTest = new Set(docIds.length ? await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: docIds }) : []);
  for (const ref of refs) {
    const id = ref._ref as string;
    if (renamed.has(id)) ref._ref = renamed.get(id);
    // A link to a live document not in the test copy: weak, so the copy can be stored on its own.
    else if (!isAssetId(id) && !inTest.has(id)) ref._weak = true;
  }
  return copy as Doc;
}

/** Live documents (by published id), ready to store in the test copy. Missing ids are skipped. */
export async function liveCopies(client: SanityClient, ids: string[]): Promise<SanityDocument[]> {
  if (!ids.length) return [];
  const live = liveReader(client);
  const docs = await live.fetch<Doc[]>(`*[_id in $ids]`, { ids: ids.map((id) => getPublishedId(id)) });
  const copies: SanityDocument[] = [];
  for (const doc of docs) copies.push((await prepare(client, live, doc)) as unknown as SanityDocument);
  return copies;
}

/**
 * Initial value for a document opened in the dev admin: its live content when the test copy does
 * not have it yet (nothing is stored until the first edit). Empty when it is already stored here.
 */
export async function liveInitialValue(client: SanityClient, id: unknown): Promise<Record<string, unknown>> {
  if (typeof id !== "string" || !id) return {};
  const publishedId = getPublishedId(id);
  const stored = await client.fetch<number>(`count(*[_id in [$id, "drafts." + $id]])`, { id: publishedId });
  if (stored) return {};
  const [copy] = await liveCopies(client, [publishedId]);
  if (!copy) return {};
  const { _id: _i, _type: _t, ...content } = copy;
  return content;
}

/** Template id for "open this live document with its live content". */
export const liveCopyTemplate = (type: string) => `live-copy-${type}`;
