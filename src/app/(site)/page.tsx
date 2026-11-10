import { Fragment } from "react";
import HomeHero from "@/components/home/HomeHero";
import { HOME_SECTIONS, orderSections } from "@/data/sections";
import ServicesHub from "@/components/home/ServicesHub";
import HomeTrips from "@/components/home/HomeTrips";
import Featured, { type FeaturedGroup } from "@/components/home/Featured";
import WhyBand from "@/components/home/WhyBand";
import HowItWorks from "@/components/home/HowItWorks";
import CorporateBand from "@/components/home/CorporateBand";
import Testimonials from "@/components/home/Testimonials";
import PartnerBand from "@/components/home/PartnerBand";
import FinalCta from "@/components/home/FinalCta";
import Marquee from "@/components/Marquee";
import OfferBanners from "@/components/OfferBanners";
import AreasServed from "@/components/AreasServed";
import FaqList from "@/components/FaqList";
import SectionTitle from "@/components/SectionTitle";
import { accent } from "@/components/Accent";
import { getBanners, getDrivers, getFaq, getHome, getPage, getSettings, getTestimonials, getVehicles, pageMetadata, getTrips } from "@/lib/content";
import { GROUPS, type Vehicle } from "@/data/vehicles";
import JsonLd from "@/components/JsonLd";
import { faqLd } from "@/lib/structuredData";

/** Cards per tab in "Popular right now"; Today trips on Home shows the same number. */
const POPULAR_MAX = 15;

/** Up to 15 vehicles per service, featured ones first; services with no vehicles are skipped. */
function popularByGroup(all: Vehicle[], labels: Record<string, string>): FeaturedGroup[] {
  return GROUPS.map((g) => {
    const list = all.filter((v) => v.group === g.id);
    const vehicles = [...list.filter((v) => v.featured), ...list.filter((v) => !v.featured)].slice(0, POPULAR_MAX);
    return { id: g.id, label: labels[g.id] || g.short, vehicles };
  }).filter((g) => g.vehicles.length > 0);
}

export const generateMetadata = () => pageMetadata("home");

/**
 * Home: promotional service slides with the all-services search, then offers, every
 * service at a glance, popular cars, areas we cover, how booking works and FAQs.
 */
export default async function Home() {
  const [home, settings, vehicles, reviews, { items: faq, sample }, drivers, search, banners, trips] = await Promise.all([
    getHome(),
    getSettings(),
    getVehicles(),
    getTestimonials(),
    getFaq(),
    getDrivers(),
    getPage("search"),
    getBanners(),
    getTrips(),
  ]);
  // Sample FAQs are tagged by service; on the home page show a mix led by car rental.
  const homeFaq = sample ? [...faq.filter((f) => f.group === "cars").slice(0, 5), ...faq.filter((f) => f.group !== "cars")].slice(0, 9) : faq.slice(0, 8);
  // Every section below the hero, keyed by name; Sanity's "Section order" decides order and visibility.
  const sections: Record<string, React.ReactNode> = {
    marquee: <Marquee items={settings.marquee} phone={settings.phone} />,
    services: <ServicesHub content={home.hub} />,
    offers: banners.length > 0 && (
      <section className="bg-surface-50 pt-12 md:pt-16" aria-label="Offers">
        <div className="container-x"><OfferBanners banners={banners} title={home.offers.title} /></div>
      </section>
    ),
    popular: <Featured content={home.featured} groups={popularByGroup(vehicles, home.featured.tabs)} drivers={drivers} driversLabel={home.featured.tabs.drivers} driversEmpty={search.driversEmpty} />,
    trips: <HomeTrips content={home.trips} trips={trips} max={POPULAR_MAX} />,
    areas: <AreasServed title={settings.areasTitle} text={settings.areasText} areas={settings.areas} highlights={settings.highlights} phone={settings.phone} />,
    why: <WhyBand content={home.why} />,
    how: <HowItWorks content={home.how} />,
    reviews: <Testimonials title={home.testimonials.title} items={reviews} />,
    partner: <PartnerBand content={home.partner} />,
    corporate: <CorporateBand content={home.corporate} />,
    faq: homeFaq.length > 0 && (
      <section className="section-y bg-white" aria-labelledby="faq-title">
        <div className="container-x">
          <SectionTitle id="faq-title" className="mb-10">{accent(home.faq.title)}</SectionTitle>
          <FaqList items={homeFaq} />
        </div>
      </section>
    ),
    final: <FinalCta content={home.final} />,
  };
  const order = orderSections(home.layout, HOME_SECTIONS);
  return (
    <>
      {order.includes("faq") && homeFaq.length > 0 && <JsonLd data={faqLd(homeFaq)} />}
      <HomeHero slides={home.slides} />
      {order.map((key) => <Fragment key={key}>{sections[key]}</Fragment>)}
    </>
  );
}
