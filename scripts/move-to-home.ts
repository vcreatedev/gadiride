/**
 * One-off: copies content that is now edited on Home from where it used to live:
 *   Site settings banners      -> Home → Offers & deals → Banners
 *   Vehicles pages offers title -> Home → Offers & deals → Heading on vehicle pages
 *   Site settings hero style   -> Home → Hero → Hero style
 *
 *   npx sanity exec scripts/move-to-home.ts --with-user-token -- --dataset development
 *   add --dry-run to only print what would change
 *
 * Only fills what Home does not have yet (setIfMissing), so it is safe to re-run.
 * The old copies are left in place (hidden in the Studio).
 */
import { getCliClient } from "sanity/cli";

const args = process.argv.slice(2);
const dataset = args[args.indexOf("--dataset") + 1];
const dryRun = args.includes("--dry-run");
if (!dataset || !["development", "production"].includes(dataset)) {
  console.error("Pass --dataset development or --dataset production");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({ dataset, useCdn: false });

async function main() {
  const old = await client.fetch<{ banners?: unknown[]; heroTheme?: string; offersTitle?: string }>(
    `{ "banners": *[_id == "siteSettings"][0].banners, "heroTheme": *[_id == "siteSettings"][0].heroTheme, "offersTitle": *[_id == "vehiclesPage"][0].offersTitle }`,
  );
  const fill: Record<string, unknown> = {};
  if (old.banners?.length) fill["offers.banners"] = old.banners;
  if (old.offersTitle) fill["offers.vehiclesTitle"] = old.offersTitle;
  if (old.heroTheme) fill.heroTheme = old.heroTheme;
  if (!Object.keys(fill).length) return console.log("Nothing to move.");
  const ids = await client.fetch<string[]>(`*[_id in ["homePage", "drafts.homePage"]]._id`);
  if (!ids.length) return console.log("No home page document yet; run the seed first.");
  console.log(`${dryRun ? "[dry run] " : ""}${Object.keys(fill).join(", ")} -> ${ids.join(", ")} (${dataset})`);
  if (dryRun) return;
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.setIfMissing({ offers: {} }).setIfMissing(fill));
  await tx.commit();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
