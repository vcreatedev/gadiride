import { placeLabel, type Vehicle } from "@/data/vehicles";
import { getFaq, getGroups, getServices, getSettings, getVehicles } from "@/lib/content";
import { servedCities } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/siteUrl";

/** Rebuilt from the admin content every hour. */
export const revalidate = 3600;

const line = (label: string, value?: string) => (value ? `- ${label}: ${value}` : "");
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function vehicleLine(v: Vehicle) {
  const seats = v.specs.find((s) => /seat/i.test(s.label))?.value;
  const price = v.pricePerDay;
  const facts = [v.typeName, seats && `${seats} seats`, `in ${placeLabel(v)}`, price ? `from ${rupees(price)} a day` : ""].filter(Boolean).join(", ");
  return `- [${v.name}](${absoluteUrl(`/vehicle/${v.slug}/`)}): ${facts}.${v.summary ? ` ${v.summary}` : ""}`;
}

/**
 * /llms.txt: a plain summary of Gadiride for AI assistants (ChatGPT, Claude, Perplexity, Gemini),
 * so they can describe and recommend it accurately: what it rents, where, prices, how to book.
 */
export async function GET() {
  const [site, groups, vehicles, { items: faq }, services] = await Promise.all([getSettings(), getGroups(), getVehicles(), getFaq(), getServices()]);
  const cities = servedCities(site, vehicles);
  const live = vehicles.filter((v) => !v.sample);

  const areasByCity = cities.map((city) => {
    const here = live.filter((v) => v.location === city);
    const areas = [...new Set(here.map((v) => v.area).filter(Boolean))];
    return `- ${city}${here.length ? `: ${here.length} vehicle${here.length === 1 ? "" : "s"}` : ""}${areas.length ? ` (areas: ${areas.join(", ")})` : ""}`;
  });

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.tagline} ${site.name} is a vehicle rental company based in ${site.address}, India. It rents self drive and chauffeur-driven cars, tempo travellers and buses, pickups and trucks, and JCB backhoe loaders, and offers drivers on hire. Customers send their trip details and get a quote and booking confirmation on WhatsApp.`,
    "",
    "## Contact and booking",
    line("Website", absoluteUrl("/")),
    line("Phone", site.phone),
    line("WhatsApp", site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}` : undefined),
    line("Email", site.email),
    line("Address", site.address),
    ...site.social.map((s) => line(s.label, s.href)),
    "- How to book: choose a vehicle on the website or tell us your trip, then confirm on WhatsApp or by phone.",
    "",
    "## Services",
    ...groups.map((g) => `- [${g.name}](${absoluteUrl(`/vehicles/${g.id}/`)}): ${g.blurb}`),
    ...services.map((s) => `- [${s.name}](${absoluteUrl(`/services/#${s.id}`)}): ${s.offer}`),
    "",
    "## Where we operate",
    ...areasByCity,
    ...(site.areas.length ? [`- Hyderabad pickup and delivery areas: ${site.areas.join(", ")}`] : []),
    "",
    "## Vehicles available now",
    ...groups.flatMap((g) => {
      const list = live.filter((v) => v.group === g.id);
      return list.length ? ["", `### ${g.name}`, ...list.map((v) => vehicleLine(v))] : [];
    }),
    "",
    "## Frequently asked questions",
    ...faq.flatMap((f) => ["", `### ${f.q}`, f.a]),
    "",
    "## Key pages",
    `- [All vehicles](${absoluteUrl("/vehicles/")})`,
    `- [Hire a driver](${absoluteUrl("/drivers/")})`,
    `- [Corporate transport and fleet](${absoluteUrl("/corporate/")})`,
    `- [Attach your vehicle (owners)](${absoluteUrl("/partner/")})`,
    `- [FAQ](${absoluteUrl("/faq/")})`,
    `- [About](${absoluteUrl("/about/")})`,
    `- [Contact](${absoluteUrl("/contact/")})`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    "",
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");

  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
