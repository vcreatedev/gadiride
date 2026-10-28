import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { GROUPS } from "@/data/vehicles";

export const metadata: Metadata = { title: "About us", description: "Gadiride brings cars, passenger vehicles, logistics vehicles and heavy equipment together in one place." };

/* TODO(client): add confirmed company history, team and registration details. Nothing here should be invented. */
export default function AboutPage() {
  return (
    <>
      <PageHero title={<>About Gadiride<span className="text-brand-500">.</span></>} intro="We bring every kind of vehicle together so you can find the right one with one message." art="van" color="#E9EBEF" />
      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="h2">What we do<span className="text-brand-500">.</span></h2>
          <div className="space-y-5 text-lg leading-relaxed">
            <p>Gadiride provides vehicles for people, goods and work: cars for daily travel, passenger vehicles for groups, trucks for goods and backhoe loaders for construction sites.</p>
            <p>Instead of calling different agencies for different needs, you tell us what you need and our team replies with options and a quote.</p>
            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {GROUPS.map((g) => <li key={g.id}><Link href={`/vehicles/${g.id}/`} className="link">{g.name}</Link></li>)}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
