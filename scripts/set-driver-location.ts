/**
 * One-off: drivers now have Location (city) and Area like vehicles. Fills them from each driver's older
 * free-text "City / area" ("Kukatpally" -> Location Hyderabad, Area Kukatpally). Published copies and
 * drafts alike; only empty fields are filled (setIfMissing), so it is safe to re-run.
 *
 *   npx sanity exec scripts/set-driver-location.ts --with-user-token -- --dataset development
 *   add --dry-run to only print what would change
 */
import { getCliClient } from "sanity/cli";
import { DEFAULT_LOCATION, LOCATION_OPTIONS } from "../src/data/cities";

const args = process.argv.slice(2);
const dataset = args[args.indexOf("--dataset") + 1];
const dryRun = args.includes("--dry-run");
if (!dataset || !["development", "production"].includes(dataset)) {
  console.error("Pass --dataset development or --dataset production");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({ dataset, useCdn: false });

/** Names that always mean the Hyderabad metro area (same list as the website's search). */
const METRO = ["hyderabad", "secunderabad", "cyberabad", "shamshabad", "medchal", "rgia"];
const has = (text: string, name: string) => new RegExp(`(^|[^a-z])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(text);

/** The driver's city from the old text: Hyderabad for the metro and unknown localities, else the named town. */
function locationOf(old: string): string {
  const text = old.toLowerCase();
  if (METRO.some((m) => has(text, m))) return DEFAULT_LOCATION;
  return LOCATION_OPTIONS.find((o) => has(text, o.toLowerCase())) ?? DEFAULT_LOCATION;
}

async function main() {
  const docs = await client.fetch<{ _id: string; name?: string; city?: string; area?: string }[]>(`*[_type == "driver" && !defined(location)]{_id, name, city, area}`);
  console.log(`${dataset}: ${docs.length} driver(s) without a location`);
  const tx = client.transaction();
  for (const d of docs) {
    const old = d.city?.trim() ?? "";
    const location = old ? locationOf(old) : DEFAULT_LOCATION;
    const first = old.split(",")[0].trim();
    const area = !d.area && first && first.toLowerCase() !== location.toLowerCase() ? first : undefined;
    console.log(`  ${d._id}  ${d.name ?? "(no name)"}: "${old || "(empty)"}" -> Location ${location}${area ? `, Area ${area}` : ""}`);
    tx.patch(d._id, (p) => p.setIfMissing({ location, ...(area ? { area } : {}) }));
  }
  if (dryRun || !docs.length) return;
  await tx.commit();
  console.log(`Done: ${docs.length} driver(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
