/**
 * One-off: keyword-rich Google titles and descriptions for the inner pages. Each page's text is
 * replaced only while it is still the original short default ("FAQ", "Contact"...), so anything
 * written in the admin is kept. Safe to re-run.
 *
 *   npx sanity exec scripts/seo-texts.ts --with-user-token -- --dataset development
 *   add --dry-run to only print what would change
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

/** Page id -> the old default title, and the new title and description. */
const TEXTS: Record<string, { oldTitle: string; title: string; description: string }> = {
  vehiclesPage: {
    oldTitle: "All vehicles",
    title: "All vehicles on rent in Hyderabad",
    description: "Self drive and chauffeur cars, tempo travellers, buses, trucks and JCBs on rent in Hyderabad. Compare them and get a quote on WhatsApp.",
  },
  servicesPage: {
    oldTitle: "Services",
    title: "Vehicle rental services in Hyderabad",
    description: "Car rental, tempo traveller and bus hire, goods transport, JCB hire, corporate fleet and driver services in Hyderabad, all from one company.",
  },
  driversPage: {
    oldTitle: "Hire a driver",
    title: "Hire a driver in Hyderabad: local & outstation",
    description: "Hire a verified, experienced driver in Hyderabad for your own car or ours, for local, airport or outstation trips. Get a quote on WhatsApp.",
  },
  corporatePage: {
    oldTitle: "Corporate transport and fleet",
    title: "Corporate car rental & staff transport in Hyderabad",
    description: "Staff transport, guest cars, long-term fleet, goods transport and machinery for companies in Hyderabad, with one point of contact.",
  },
  partnerPage: {
    oldTitle: "Attach your vehicle",
    title: "Attach your car, bus, truck or JCB with Gadiride",
    description: "Own a car, bus, truck or JCB? Attach it with Gadiride in Hyderabad and earn from rentals, with or without a driver.",
  },
  faqPage: {
    oldTitle: "FAQ",
    title: "Vehicle rental FAQs: cars, buses, trucks & JCBs",
    description: "Answers to common questions on renting self drive cars, tempo travellers, buses, trucks and JCBs in Hyderabad: booking, drivers, goods transport and heavy equipment.",
  },
  aboutPage: {
    oldTitle: "About us",
    title: "About Gadiride: vehicle rental company in Hyderabad",
    description: "Gadiride is a Hyderabad vehicle rental company for self drive and chauffeur cars, tempo travellers, buses, trucks and JCBs, with quotes and bookings on WhatsApp.",
  },
  contactPage: {
    oldTitle: "Contact",
    title: "Contact Gadiride: call or WhatsApp 94915 44981",
    description: "Call or WhatsApp Gadiride on 94915 44981 for self drive cars, chauffeur cars, tempo travellers, buses, trucks and JCBs on rent in Hyderabad.",
  },
  careersPage: {
    oldTitle: "Careers",
    title: "Driver & JCB operator jobs in Hyderabad",
    description: "Work with Gadiride in Hyderabad as a car driver, heavy vehicle driver, JCB operator or in operations. Apply online and we call you back.",
  },
};

async function main() {
  const ids = Object.keys(TEXTS);
  const docs = await client.fetch<{ _id: string; title?: string }[]>(`*[_id in $ids]{_id, "title": seo.title}`, { ids });
  const tx = client.transaction();
  let changes = 0;
  for (const d of docs) {
    const t = TEXTS[d._id];
    if (d.title && d.title !== t.oldTitle) {
      console.log(`  ${d._id}: kept (customised: "${d.title}")`);
      continue;
    }
    console.log(`  ${d._id}: "${d.title ?? "(empty)"}" -> "${t.title}"`);
    tx.patch(d._id, (p) => p.setIfMissing({ seo: {} }).set({ "seo.title": t.title, "seo.description": t.description }));
    changes += 1;
  }
  console.log(`${dataset}: ${changes} page(s) to update`);
  if (dryRun || !changes) return;
  await tx.commit();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
