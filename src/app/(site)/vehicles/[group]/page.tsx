import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { orderSections, VEHICLE_PAGE_SECTIONS } from "@/data/sections";
import PageHero from "@/components/PageHero";
import type { SceneId } from "@/components/HeroScene";
import VehiclesBrowser from "@/components/VehiclesBrowser";
import BookingCard from "@/components/BookingCard";
import FaqList from "@/components/FaqList";
import { accent } from "@/components/Accent";
import Marquee from "@/components/Marquee";
import OfferBanners from "@/components/OfferBanners";
import AreasServed from "@/components/AreasServed";
import { GROUPS, HERO_VARIANTS, type GroupId } from "@/data/vehicles";
import { getBanners, getFaq, getGroups, getHome, getPage, getSettings, getTrips, getVehicles } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, vehicleListLd } from "@/lib/structuredData";
import { buildMetadata, shareImageUrl } from "@/lib/seo";

const SCENE: Record<GroupId, SceneId> = { cars: "city", passenger: "highway", logistics: "port", equipment: "site" };

export const dynamicParams = false;
export function generateStaticParams() {
  return GROUPS.map((g) => ({ group: g.id }));
}

/** Search titles and descriptions per service, used until the admin sets its own (Search & sharing). */
const GROUP_SEO: Record<GroupId, { title: string; description: string }> = {
  cars: {
    title: "Self drive & chauffeur car rental in Hyderabad",
    description: "Rent self drive and chauffeur-driven cars in Hyderabad: hatchbacks, sedans, SUVs and luxury cars with doorstep and RGIA airport delivery. Get a quote on WhatsApp.",
  },
  passenger: {
    title: "Tempo traveller & bus rental in Hyderabad",
    description: "Hire tempo travellers, minibuses and buses in Hyderabad for family trips, weddings, events, pilgrimages and staff transport. Share your group size and get a quote on WhatsApp.",
  },
  logistics: {
    title: "Truck & pickup rental in Hyderabad",
    description: "Hire pickups and trucks in Hyderabad for shop deliveries, business goods and house shifting. Share your load and route and get a quote on WhatsApp.",
  },
  equipment: {
    title: "JCB (backhoe loader) rental in Hyderabad",
    description: "Hire JCB backhoe loaders in Hyderabad for construction, digging and site work, with or without an operator. Share your site details and get a quote on WhatsApp.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group: key } = await params;
  const [groups, site] = await Promise.all([getGroups(), getSettings()]);
  const g = groups.find((x) => x.id === key);
  const fallback = GROUP_SEO[key as GroupId];
  return buildMetadata({
    title: g?.seoTitle || fallback?.title || g?.name || "Vehicles",
    description: g?.seoDescription || fallback?.description || g?.blurb,
    path: `/vehicles/${key}/`,
    image: shareImageUrl(g?.seoImage ?? g?.heroPhoto ?? site.shareImage),
  });
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: key } = await params;
  const [groups, vehicles, site, faqData, p, allBanners, home, trips] = await Promise.all([getGroups(), getVehicles(), getSettings(), getFaq(), getPage("vehicles"), getBanners(), getHome(), key === "cars" ? getTrips() : Promise.resolve([])]);
  const g = groups.find((x) => x.id === key);
  if (!g) notFound();
  // Sample FAQs are tagged per service; FAQs from Sanity show the first few.
  const faq = faqData.sample
    ? [...faqData.items.filter((f) => f.group === g.id), ...faqData.items.filter((f) => !f.group)].slice(0, g.id === "cars" ? 8 : 4)
    : faqData.items.slice(0, 6);
  const banners = allBanners.filter((b) => (b.group || "cars") === g.id);
  const isCars = g.id === "cars";
  // Each page's own heading; the old shared "Our {group}." text until one is set.
  const listTitle = isCars ? p.listTitleCars : g.listTitle || p.listTitle.replace("{group}", g.name.toLowerCase());
  // Sections under the hero, in the order set in Sanity (Vehicles pages → Section order).
  const sections: Record<string, React.ReactNode> = {
    marquee: <Marquee items={site.marquee} phone={site.phone} />,
    offers: banners.length > 0 && (
      <section className="bg-surface-50 pt-10 md:pt-14" aria-label="Offers">
        <div className="container-x"><OfferBanners banners={banners} title={home.offers.vehiclesTitle || p.offersTitle} /></div>
      </section>
    ),
    vehicles: (
      <section id="all" className="scroll-mt-20 bg-surface-50 py-10 md:py-14">
        <div className="container-x">
          <VehiclesBrowser title={listTitle} mixedTitle={p.listTitleMixed} trips={isCars ? trips : undefined} tripTexts={{ heading: p.tripsHeading, title: p.tripsEmptyTitle, empty: p.tripsEmpty, othersTitle: p.tripsOthersTitle }} vehicles={vehicles} lockGroup={g.id as GroupId} showPrices={site.showPrices} empty={{ title: p.emptyTitle, text: p.emptyText, outsideTitle: p.outsideTitle, outsideText: p.outsideText }} />
        </div>
      </section>
    ),
    areas: isCars && <AreasServed title={site.areasTitle} text={site.areasText} areas={site.areas} highlights={site.highlights} phone={site.phone} />,
    faq: faq.length > 0 && (
      <section className={`section-y ${isCars ? "bg-surface-50" : "bg-white"}`}>
        <div className="container-x"><h2 className="h2 mb-10">{accent(p.faqTitle)}</h2><FaqList items={faq} /></div>
      </section>
    ),
  };
  const order = orderSections(p.layout, VEHICLE_PAGE_SECTIONS);
  const inGroup = vehicles.filter((v) => v.group === g.id);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: g.name, path: `/vehicles/${g.id}/` }]),
          ...(inGroup.length ? [vehicleListLd(`${g.name} on rent`, inGroup)] : []),
          ...(order.includes("faq") && faq.length ? [faqLd(faq)] : []),
        ]}
      />
      <PageHero full scene={SCENE[g.id as GroupId]} bgPhoto={g.heroPhoto} bgPhotoMobile={g.heroPhotoMobile} bgFit={g.heroFit} variants={HERO_VARIANTS[g.id as GroupId]} title={<>{g.name}<span className="text-brand-500">.</span></>} intro={g.blurb} art={g.art} color={g.color} bottom={<BookingCard lockTab={g.id as GroupId} />} />
      {order.map((k) => <Fragment key={k}>{sections[k]}</Fragment>)}
    </>
  );
}
