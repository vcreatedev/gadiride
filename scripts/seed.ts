/**
 * Fills a Sanity dataset with the site's current text and photos so every
 * section is editable in the Studio straight away.
 *
 *   npm run seed:dev     -> development dataset
 *   npm run seed:prod    -> production dataset
 *   add -- --dry-run     -> only print what would be created
 *
 * Safe to re-run: documents are created only if they do not exist yet
 * (createIfNotExists), so edits made in the Studio are never overwritten.
 */
import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";
import { homeDefaults, pageDefaults, footerDefaults } from "../src/content/defaults";
import { GROUPS, TYPES, VEHICLES } from "../src/data/vehicles";
import { SERVICES, CAREER_ROLES } from "../src/data/services";
import { FAQ } from "../src/data/faq";
import { site } from "../src/config/site";

const args = process.argv.slice(2);
const dataset = args[args.indexOf("--dataset") + 1];
const dryRun = args.includes("--dry-run");
if (!dataset || !["development", "production"].includes(dataset)) {
  console.error('Pass --dataset development or --dataset production');
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2025-01-01" }).withConfig({ dataset, useCdn: false });
const root = process.cwd();

type Doc = { _id: string; _type: string; [k: string]: unknown };

let keyN = 0;
/** Array member type names, matching the schema. */
const MEMBER: Record<string, string> = { banners: "banner", highlights: "item", chapters: "chapter", promos: "promo", items: "item", steps: "item", uses: "item", specs: "spec", cities: "city", social: "socialLink" };
/** Arrays of objects need a _key and the member _type in Sanity. */
function withKeys<T>(v: T, field = ""): T {
  if (Array.isArray(v))
    return v.map((x) =>
      x && typeof x === "object" && !Array.isArray(x) ? { _key: `k${(keyN++).toString(36)}`, _type: MEMBER[field] ?? "object", ...withKeys(x) } : x,
    ) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withKeys(x, k)])) as T;
  return v;
}

const uploaded = new Map<string, string>();
async function image(relPath: string, alt?: string) {
  const file = join(root, "public", relPath);
  if (!existsSync(file)) return undefined;
  if (dryRun) return { _type: "image", asset: { _type: "reference", _ref: `(upload ${relPath})` }, alt };
  let id = uploaded.get(file);
  if (!id) {
    const asset = await client.assets.upload("image", createReadStream(file), { filename: relPath.split("/").pop() });
    id = asset._id;
    uploaded.set(file, id);
  }
  return { _type: "image", asset: { _type: "reference", _ref: id }, alt };
}

/** Prefer the large JPG originals; Sanity's CDN serves resized AVIF/WebP. */
const vehiclePhoto = (id: string, alt: string) => (existsSync(join(root, "public/vehicles", `${id}.jpg`)) ? image(`vehicles/${id}.jpg`, alt) : image(`vehicles/${id}.webp`, alt));

const ART_PHOTO: Record<string, string> = { hatch: "hatchback", sedan: "sedan", suv: "suv", pickup: "pickup", van: "tempo", truck: "truck", bus: "bus", jcb: "jcb" };

async function main() {
  console.log(`${dryRun ? "[dry run] " : ""}Seeding dataset "${dataset}" of project ${client.config().projectId}`);
  const existing = new Set<string>(dryRun ? [] : await client.fetch<string[]>(`*[!(_id in path("drafts.**"))]._id`));
  const docs: Doc[] = [];
  const add = async (id: string, make: () => Promise<Doc> | Doc) => {
    if (existing.has(id)) return console.log(`  skip   ${id} (already exists)`);
    docs.push(await make());
    console.log(`  create ${id}`);
  };

  await add("siteSettings", async () => ({
    _id: "siteSettings",
    _type: "siteSettings",
    tagline: site.tagline,
    footerBlurb: footerDefaults.blurb,
    // Sample prices: visible on development, hidden on production until real prices are checked.
    showPrices: dataset !== "production",
    whatsappNumber: site.whatsappNumber,
    phone: site.phone,
    address: site.address,
    ...withKeys({ cities: site.cities, banners: site.banners, highlights: site.highlights }),
    marquee: site.marquee,
    areasTitle: site.areasTitle,
    areasText: site.areasText,
    areas: site.areas,
    heroTheme: site.heroTheme,
    showIntro: true,
    logo: await image("brand/gadiride-logo.webp", "Gadiride"),
    shareImage: await image("brand/og.jpg", "Gadiride"),
  }));

  await add("homePage", () => ({ _id: "homePage", _type: "homePage", ...withKeys(homeDefaults) }));
  for (const [key, value] of Object.entries(pageDefaults)) {
    const id = `${key}Page`;
    await add(id, () => ({ _id: id, _type: id, ...withKeys(value) }));
  }

  for (const g of GROUPS) {
    await add(`group-${g.id}`, () => ({ _id: `group-${g.id}`, _type: "vehicleGroup", key: g.id, name: g.name, short: g.short, blurb: g.blurb }));
  }

  for (const [i, t] of TYPES.entries()) {
    await add(`type-${t.id}`, async () => ({
      _id: `type-${t.id}`,
      _type: "vehicleType",
      name: t.name,
      key: { _type: "slug", current: t.id },
      group: t.group,
      art: t.art,
      order: (i + 1) * 10,
      image: await vehiclePhoto(t.id, t.name),
    }));
  }

  for (const [i, s] of SERVICES.entries()) {
    await add(`service-${s.id}`, async () => ({
      _id: `service-${s.id}`,
      _type: "service",
      name: s.name,
      key: { _type: "slug", current: s.id },
      forWho: s.forWho,
      offer: s.offer,
      points: s.points,
      cta: s.cta,
      form: s.form,
      toConfirm: !!s.toConfirm,
      order: (i + 1) * 10,
      image: await vehiclePhoto(ART_PHOTO[s.art] ?? "sedan", s.name),
    }));
  }

  for (const [i, v] of VEHICLES.entries()) {
    await add(`vehicle-${v.slug}`, () => ({
      _id: `vehicle-${v.slug}`,
      _type: "vehicle",
      name: v.name,
      slug: { _type: "slug", current: v.slug },
      group: v.group,
      type: { _type: "reference", _ref: `type-${v.type}` },
      summary: v.summary,
      specs: withKeys(v.specs, "specs"),
      options: v.options,
      pricePerDay: v.pricePerDay,
      available: true,
      featured: !!v.featured,
      order: (i + 1) * 10,
      photoFit: "cover",
      photoBackground: "studio",
      photoZoom: 100,
    }));
  }

  for (const [i, f] of FAQ.entries()) {
    await add(`faq-${i + 1}`, () => ({ _id: `faq-${i + 1}`, _type: "faq", question: f.q, answer: f.a, order: (i + 1) * 10 }));
  }
  for (const [i, r] of CAREER_ROLES.entries()) {
    await add(`role-${i + 1}`, () => ({ _id: `role-${i + 1}`, _type: "careerRole", role: r.role, detail: r.detail, order: (i + 1) * 10 }));
  }

  if (dryRun) return console.log(`\n${docs.length} documents would be created.`);
  if (!docs.length) return console.log("\nNothing to do: every document already exists.");

  // Types must exist before vehicles reference them, so commit in one transaction.
  const tx = client.transaction();
  docs.forEach((d) => tx.createIfNotExists(d));
  await tx.commit({ visibility: "async" });
  console.log(`\nDone: ${docs.length} documents created in "${dataset}".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
