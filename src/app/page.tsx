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
import Cities from "@/components/home/Cities";
import FinalCta from "@/components/home/FinalCta";
import ScrollDrive from "@/components/ScrollDrive";
import FaqList from "@/components/FaqList";
import SectionTitle from "@/components/SectionTitle";

export default function Home() {
  return (
    <>
      <Hero />
      <StyleRail />
      <Featured />
      <LineStory />
      <MeetFleet />
      <ServicesGrid />
      <Promos />
      <WhyBand />
      <HowItWorks />
      <ScrollDrive art="pickup" color="#B7BBC2" />
      <CorporateBand />
      <CareersTeaser />
      <Cities />
      {/* Testimonials: add a section here once verified reviews are supplied. */}
      <section className="section-y bg-white" aria-labelledby="faq-title">
        <div className="container-x">
          <SectionTitle id="faq-title" className="mb-10">Questions, answered<span className="text-brand-500">.</span></SectionTitle>
          <FaqList />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
