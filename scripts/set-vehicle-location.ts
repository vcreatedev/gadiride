/**
 * One-off: gives every vehicle without a Location the default (Hyderabad), published copies and
 * drafts alike, so the admin dropdown shows it and drafts don't look changed.
 *
 *   npx sanity exec scripts/set-vehicle-location.ts --with-user-token -- --dataset development
 *   add --dry-run to only print what would change
 *
 * Only fills empty locations (setIfMissing), so it is safe to re-run.
 */
import { getCliClient } from "sanity/cli";
import { DEFAULT_LOCATION } from "../src/data/cities";

const args = process.argv.slice(2);
const dataset = args[args.indexOf("--dataset") + 1];
const dryRun = args.includes("--dry-run");
if (!dataset || !["development", "production"].includes(dataset)) {
  console.error("Pass --dataset development or --dataset production");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({ dataset, useCdn: false });

async function main() {
  const docs = await client.fetch<{ _id: string; name?: string }[]>(`*[_type == "vehicle" && !defined(location)]{_id, name}`);
  console.log(`${dataset}: ${docs.length} vehicle(s) without a location`);
  for (const d of docs) console.log(`  ${d._id}  ${d.name ?? "(no name)"}`);
  if (dryRun || !docs.length) return;
  const tx = client.transaction();
  for (const d of docs) tx.patch(d._id, (p) => p.setIfMissing({ location: DEFAULT_LOCATION }));
  await tx.commit();
  console.log(`Set location = ${DEFAULT_LOCATION} on ${docs.length} vehicle(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
