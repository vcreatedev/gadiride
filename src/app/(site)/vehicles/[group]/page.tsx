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
import { getBanners, getFaq, getGroups, getHome, getPage, getSettings, getVehicles } from "@/lib/content";

const SCENE: Record<GroupId, SceneId> = { cars: "city", passenger: "highway", logistics: "port", equipment: "site" };

export const dynamicParams = false;
export function generateStaticParams() {
  return GROUPS.map((g) => ({ group: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group: key } = await params;
  const g = (await getGroups()).find((x) => x.id === key);
  if (key === "cars") return { title: { absolute: "Self drive car rental in Hyderabad | Gadiride" }, description: g?.blurb };
  return { title: g?.name ?? "Vehicles", description: g?.blurb };
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: key } = await params;
  const [groups, vehicles, site, faqData, p, allBanners, home] = await Promise.all([getGroups(), getVehicles(), getSettings(), getFaq(), getPage("vehicles"), getBanners(), getHome()]);
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
      <section className="bg-surface-50 pt-14 md:pt-20" aria-label="Offers">
        <div className="container-x"><OfferBanners banners={banners} title={home.offers.vehiclesTitle || p.offersTitle} /></div>
      </section>
    ),
    vehicles: (
      <section id="all" className="scroll-mt-20 bg-surface-50 py-14 md:py-20">
        <div className="container-x">
          <VehiclesBrowser title={listTitle} mixedTitle={p.listTitleMixed} vehicles={vehicles} lockGroup={g.id as GroupId} showPrices={site.showPrices} empty={{ title: p.emptyTitle, text: p.emptyText, outsideTitle: p.outsideTitle, outsideText: p.outsideText }} />
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
  return (
    <>
      <PageHero full scene={SCENE[g.id as GroupId]} bgPhoto={g.heroPhoto} bgPhotoMobile={g.heroPhotoMobile} bgFit={g.heroFit} variants={HERO_VARIANTS[g.id as GroupId]} title={<>{g.name}<span className="text-brand-500">.</span></>} intro={g.blurb} art={g.art} color={g.color} bottom={<BookingCard lockTab={g.id as GroupId} />} />
      {orderSections(p.layout, VEHICLE_PAGE_SECTIONS).map((k) => <Fragment key={k}>{sections[k]}</Fragment>)}
    </>
  );
}
