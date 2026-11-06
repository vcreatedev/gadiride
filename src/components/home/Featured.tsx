import Link from "next/link";
import VehicleCard from "../VehicleCard";
import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";
import type { HomeContent } from "@/content/defaults";
import type { Vehicle } from "@/data/vehicles";

export default function Featured({ content: c, vehicles, showPrices }: { content: HomeContent["featured"]; vehicles: Vehicle[]; showPrices: boolean }) {
  if (!vehicles.length) return null;
  return (
    <section className="section-y bg-surface-50" aria-labelledby="featured-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionTitle id="featured-title">{accent(c.title)}</SectionTitle>
            <p className="lead mt-4">{c.text}</p>
          </div>
          <Link href="/vehicles/" className="link shrink-0">{c.linkLabel}</Link>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v, i) => (
            <li key={v.slug} className="flex h-full">
              <VehicleCard v={v} showPrices={showPrices} priority={i < 3} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
