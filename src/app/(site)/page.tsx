import HomeHero from "@/components/home/HomeHero";
import ServicesHub from "@/components/home/ServicesHub";
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
import { getDrivers, getFaq, getHome, getPage, getSettings, getTestimonials, getVehicles, pageMetadata } from "@/lib/content";
import { GROUPS, type Vehicle } from "@/data/vehicles";

const POPULAR_MAX = 15;
const TAB_LABEL: Record<string, string> = { cars: "Cars", passenger: "Tempo & buses", logistics: "Trucks", equipment: "JCB & equipment" };

/** Up to 15 vehicles per service, featured ones first; services with no vehicles are skipped. */
function popularByGroup(all: Vehicle[]): FeaturedGroup[] {
  return GROUPS.map((g) => {
    const list = all.filter((v) => v.group === g.id);
    const vehicles = [...list.filter((v) => v.featured), ...list.filter((v) => !v.featured)].slice(0, POPULAR_MAX);
    return { id: g.id, label: TAB_LABEL[g.id] ?? g.short, vehicles };
  }).filter((g) => g.vehicles.length > 0);
}

export const generateMetadata = () => pageMetadata("home");

/**
 * Home: promotional service slides with the all-services search, then offers, every
 * service at a glance, popular cars, areas we cover, how booking works and FAQs.
 */
export default async function Home() {
  const [home, settings, vehicles, reviews, { items: faq, sample }, drivers, search] = await Promise.all([
    getHome(),
    getSettings(),
    getVehicles(),
    getTestimonials(),
    getFaq(),
    getDrivers(),
    getPage("search"),
  ]);
  // Sample FAQs are tagged by service; on the home page show a mix led by car rental.
  const homeFaq = sample ? [...faq.filter((f) => f.group === "cars").slice(0, 5), ...faq.filter((f) => f.group !== "cars")].slice(0, 9) : faq.slice(0, 8);
  return (
    <>
      <HomeHero slides={home.slides} />
      <Marquee items={settings.marquee} phone={settings.phone} />
      <ServicesHub content={home.hub} />
      {settings.banners.length > 0 && (
        <section className="bg-surface-50 pt-16 md:pt-24" aria-label="Offers">
          <div className="container-x"><OfferBanners banners={settings.banners} title="Offers & deals." /></div>
        </section>
      )}
      <Featured content={home.featured} groups={popularByGroup(vehicles)} drivers={drivers} driversEmpty={search.driversEmpty} showPrices={settings.showPrices} />
      <AreasServed title={settings.areasTitle} text={settings.areasText} areas={settings.areas} highlights={settings.highlights} phone={settings.phone} />
      <WhyBand content={home.why} />
      <HowItWorks content={home.how} />
      <Testimonials title={home.testimonials.title} items={reviews} />
      <PartnerBand content={home.partner} />
      <CorporateBand content={home.corporate} />
      {homeFaq.length > 0 && (
        <section className="section-y bg-white" aria-labelledby="faq-title">
          <div className="container-x">
            <SectionTitle id="faq-title" className="mb-10">{accent(home.faq.title)}</SectionTitle>
            <FaqList items={homeFaq} />
          </div>
        </section>
      )}
      <FinalCta content={home.final} />
    </>
  );
}
