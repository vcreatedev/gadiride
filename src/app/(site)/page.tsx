import Hero from "@/components/Hero";
import StyleRail from "@/components/home/StyleRail";
import Featured from "@/components/home/Featured";
import LineStory from "@/components/home/LineStory";
import MeetFleet from "@/components/home/MeetFleet";
import ServicesGrid from "@/components/home/ServicesGrid";
import Promos from "@/components/home/Promos";
import WhyBand from "@/components/home/WhyBand";
import HowItWorks from "@/components/home/HowItWorks";
import CorporateBand from "@/components/home/CorporateBand";
import CareersTeaser from "@/components/home/CareersTeaser";
import Testimonials from "@/components/home/Testimonials";
import PartnerBand from "@/components/home/PartnerBand";
import Cities from "@/components/home/Cities";
import FinalCta from "@/components/home/FinalCta";
import ScrollDrive from "@/components/ScrollDrive";
import FaqList from "@/components/FaqList";
import SectionTitle from "@/components/SectionTitle";
import { accent } from "@/components/Accent";
import { getFaq, getFeaturedVehicles, getHome, getServices, getSettings, getTestimonials, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("home");

export default async function Home() {
  const [home, settings, featured, services, reviews, { items: faq }] = await Promise.all([
    getHome(),
    getSettings(),
    getFeaturedVehicles(),
    getServices(),
    getTestimonials(),
    getFaq(),
  ]);
  return (
    <>
      <Hero content={home.hero} />
      <StyleRail title={home.styles.title} />
      <Featured content={home.featured} vehicles={featured} showPrices={settings.showPrices} />
      <LineStory content={home.story} />
      <MeetFleet content={home.fleet} />
      <ServicesGrid content={home.services} services={services} />
      <Promos items={home.promos} />
      <WhyBand content={home.why} />
      <HowItWorks content={home.how} />
      <Testimonials title={home.testimonials.title} items={reviews} />
      <ScrollDrive art="pickup" color="#B7BBC2" />
      <CorporateBand content={home.corporate} />
      <PartnerBand content={home.partner} />
      <CareersTeaser content={home.careers} />
      <Cities title={home.cities.title} cities={settings.cities} />
      {faq.length > 0 && (
        <section className="section-y bg-white" aria-labelledby="faq-title">
          <div className="container-x">
            <SectionTitle id="faq-title" className="mb-10">{accent(home.faq.title)}</SectionTitle>
            <FaqList items={faq} />
          </div>
        </section>
      )}
      <FinalCta content={home.final} />
    </>
  );
}
