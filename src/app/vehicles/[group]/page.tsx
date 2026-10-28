import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import VehiclesBrowser from "@/components/VehiclesBrowser";
import RequestForm from "@/components/RequestForm";
import FaqList from "@/components/FaqList";
import { GROUPS, type GroupId } from "@/data/vehicles";
import { FAQ } from "@/data/faq";

export const dynamicParams = false;
export function generateStaticParams() { return GROUPS.map((g) => ({ group: g.id })); }

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group: key } = await params;
  const g = GROUPS.find((x) => x.id === key);
  return { title: g?.name ?? "Vehicles", description: g?.blurb };
}

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: key } = await params;
  const g = GROUPS.find((x) => x.id === key);
  if (!g) notFound();
  const faq = FAQ.filter((_, i) => [1, g.id === "cars" ? 2 : g.id === "logistics" ? 4 : g.id === "equipment" ? 5 : 3, 7].includes(i));
  return (
    <>
      <PageHero title={<>{g.name}<span className="text-brand-500">.</span></>} intro={g.blurb} art={g.art} color={g.color} />
      <section className="section-y bg-surface-50">
        <div className="container-x"><VehiclesBrowser lockGroup={g.id as GroupId} /></div>
      </section>
      <section className="section-y bg-white" aria-labelledby="group-quote">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="group-quote" className="h2">Get a quote<span className="text-brand-500">.</span></h2>
            <p className="lead mt-4">Fill in the details and continue on WhatsApp. Our team replies with availability and price.</p>
          </div>
          <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line sm:p-8"><RequestForm formKey={g.id as GroupId} idPrefix={`grp-${g.id}`} compact /></div>
        </div>
      </section>
      <section className="section-y bg-surface-50"><div className="container-x"><h2 className="h2 mb-10">Good to know<span className="text-brand-500">.</span></h2><FaqList items={faq} /></div></section>
    </>
  );
}
