import Link from "next/link";
import { VEHICLES } from "@/data/vehicles";
import VehicleCard from "../VehicleCard";
import SectionTitle from "../SectionTitle";

const PICKS = ["seven-seater-suv", "executive-sedan", "tempo-traveller-12", "box-truck-19ft", "backhoe-loader", "luxury-sedan"];

export default function Featured() {
  const list = PICKS.map((s) => VEHICLES.find((v) => v.slug === s)!);
  return (
    <section className="section-y bg-surface-50" aria-labelledby="featured-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionTitle id="featured-title">Popular right now<span className="text-brand-500">.</span></SectionTitle>
            <p className="lead mt-4">A few of the vehicles customers ask for most. Every request gets a quote from our team.</p>
          </div>
          <Link href="/vehicles/" className="link shrink-0">View all vehicles</Link>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => <li key={v.slug}><VehicleCard v={v} /></li>)}
        </ul>
      </div>
    </section>
  );
}
