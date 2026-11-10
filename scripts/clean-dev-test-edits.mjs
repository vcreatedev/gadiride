/**
 * Deletes test edits from the development dataset once they are an hour old.
 *
 * The dev site (dev.gadiride.com, local server) shows the live production content with the
 * documents edited in its admin on top (see fetchWithTestEdits in src/lib/content.ts). Only those
 * edited documents are stored in development. This removes them after KEEP_MINUTES (default 60),
 * so dev falls back to the live content and nothing builds up. Production is never touched: every
 * write here is fixed to the development dataset.
 *
 * Each run, in development only:
 *   1. Documents, drafts and release versions not changed for an hour are deleted.
 *   2. Photos and files uploaded more than an hour ago that nothing uses any more are deleted.
 *
 *   SANITY_SYNC_TOKEN=... node scripts/clean-dev-test-edits.mjs            run it
 *   SANITY_SYNC_TOKEN=... node scripts/clean-dev-test-edits.mjs --dry-run  only print the plan
 *   KEEP_MINUTES=0 ...                                                     delete every test edit now
 *
 * Runs every hour from .github/workflows/sync-dev-data.yml. No npm packages needed (Node 18+).
 */

const TARGET = "development";
const LIVE = "production";
const API = "v2025-01-01";
const KEEP_MINUTES = Number(process.env.KEEP_MINUTES ?? 60);
const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_SYNC_TOKEN;
const ASSETS = `_type in ["sanity.imageAsset", "sanity.fileAsset"]`;
/** Sanity's own permission and system records: never touched. */
const SYSTEM = `(_id in path("_.**") || _id in path("system.**"))`;

if (!PROJECT_ID || !TOKEN) {
  console.error("Set SANITY_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID) and SANITY_SYNC_TOKEN.");
  process.exit(1);
}
if (TARGET === LIVE) throw new Error("Refusing to clean the live dataset.");

const BASE = `https://${PROJECT_ID}.api.sanity.io/${API}`;

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { Authorization: `Bearer ${TOKEN}`, ...(init.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const why = body.error?.description ?? body.error?.message ?? body.message ?? res.statusText;
    throw new Error(`${init.method ?? "GET"} ${path.split("?")[0]} -> ${res.status} ${why}`);
  }
  return body;
}

/** Reads the development dataset as stored (drafts included). */
const query = async (groq) => (await api(`/data/query/${TARGET}?perspective=raw&query=${encodeURIComponent(groq)}`)).result;

/** The only way this script writes data: deletes in TARGET (development). */
async function remove(ids) {
  if (!ids.length || DRY_RUN) return;
  await api(`/data/mutate/${TARGET}?visibility=sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: ids.map((id) => ({ delete: { id } })) }),
  });
}

/** Deletes all at once; if that fails, one by one, so one blocked item doesn't stop the rest. */
async function removeEach(label, ids) {
  try {
    await remove(ids);
    return { removed: ids.length, failed: 0 };
  } catch (err) {
    console.warn(`${label}: ${err.message}. Retrying one by one.`);
  }
  let removed = 0;
  let failed = 0;
  for (const id of ids) {
    try {
      await remove([id]);
      removed++;
    } catch (err) {
      // Still used by a test edit that is not an hour old yet: it goes on a later run.
      if (/referen/i.test(err.message)) console.log(`  kept ${id} for now: a recent test edit still uses it`);
      else { failed++; console.error(`  failed ${id}: ${err.message}`); }
    }
  }
  return { removed, failed };
}

const cutoff = new Date(Date.now() - KEEP_MINUTES * 60_000).toISOString();
const minutesLeft = (updatedAt) => Math.max(1, Math.ceil((Date.parse(updatedAt) - Date.parse(cutoff)) / 60_000));

async function main() {
  console.log(`${DRY_RUN ? "[dry run] " : ""}${TARGET} (project ${PROJECT_ID}): removing test edits older than ${KEEP_MINUTES} min`);
  const docs = await query(`*[!${SYSTEM} && !(${ASSETS})]{_id, _updatedAt}`);
  const old = docs.filter((d) => d._updatedAt <= cutoff).map((d) => d._id);
  for (const d of docs.filter((x) => x._updatedAt > cutoff)) console.log(`  test edit kept: ${d._id} (removed in about ${minutesLeft(d._updatedAt)} min)`);
  const docResult = await removeEach("documents", old);

  // After the documents, so photos only they used are free to go.
  const assets = await query(`*[${ASSETS} && _updatedAt <= $cutoff && count(*[references(^._id)]) == 0]._id`.replace("$cutoff", JSON.stringify(cutoff)));
  const assetResult = await removeEach("photos", assets);

  console.log(`Done: ${docResult.removed} test document(s) removed, ${docs.length - old.length} kept; ${assetResult.removed} unused photo(s) removed.`);
  if (docResult.failed + assetResult.failed) {
    console.error(`${docResult.failed + assetResult.failed} item(s) failed; see above.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
