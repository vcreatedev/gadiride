import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FaqList from "@/components/FaqList";

export const metadata: Metadata = { title: "FAQ", description: "Answers about vehicles, booking requests, drivers, goods transport and heavy equipment." };

export default function FaqPage() {
  return (
    <>
      <PageHero title={<>Questions, answered<span className="text-brand-500">.</span></>} intro="Anything else? Ask us on WhatsApp." />
      <section className="section-y bg-white"><div className="container-x"><FaqList /></div></section>
    </>
  );
}
