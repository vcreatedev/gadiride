/**
 * One-off: a vehicle's photos are now one list (Photos), and the first one is the main photo.
 * Moves each vehicle's separate "Main photo" to the top of Photos (unless it is already in the list),
 * then clears the old field. Published copies and drafts alike.
 *
 *   npx sanity exec scripts/merge-vehicle-photos.ts --with-user-token -- --dataset development
 *   add --dry-run to only print what would change
 *
 * Safe to re-run: vehicles without a separate main photo are skipped.
 */
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const args = process.argv.slice(2);
const dataset = args[args.indexOf("--dataset") + 1];
const dryRun = args.includes("--dry-run");
if (!dataset || !["development", "production"].includes(dataset)) {
  console.error("Pass --dataset development or --dataset production");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({ dataset, useCdn: false });

type Img = { _type?: string; _key?: string; asset?: { _ref?: string }; crop?: unknown; hotspot?: unknown; alt?: string };
type Doc = { _id: string; name?: string; image?: Img; gallery?: Img[] };

async function main() {
  const docs = await client.fetch<Doc[]>(`*[_type == "vehicle" && defined(image.asset)]{_id, name, image, gallery}`);
  console.log(`${dataset}: ${docs.length} vehicle(s) with a separate main photo`);
  const tx = client.transaction();
  for (const d of docs) {
    const ref = d.image?.asset?._ref;
    const gallery = d.gallery ?? [];
    const already = gallery.some((g) => g.asset?._ref === ref);
    console.log(`  ${d._id}  ${d.name ?? "(no name)"}  ${already ? "already in Photos: clear old field" : "move to the top of Photos"}`);
    const { _type: _t, _key: _k, ...rest } = d.image ?? {};
    const first = { ...rest, _type: "image", _key: randomUUID().replace(/-/g, "").slice(0, 12) };
    tx.patch(d._id, (p) => {
      if (already) return p.unset(["image"]);
      // Inserting before item 0 needs a non-empty list; an empty one is simply set.
      return (gallery.length ? p.insert("before", "gallery[0]", [first]) : p.set({ gallery: [first] })).unset(["image"]);
    });
  }
  if (dryRun || !docs.length) return;
  await tx.commit();
  console.log(`Done: ${docs.length} vehicle(s) now use the first of Photos as the main photo.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
