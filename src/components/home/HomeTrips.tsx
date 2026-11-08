import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";
import { TripCard } from "../TripsList";
import type { Trip } from "@/lib/trips";

/** Home: upcoming shared trips (same count as "Popular right now"), soonest first. */
export default function HomeTrips({ content: c, trips, max }: { content: { title: string; text: string; linkLabel: string }; trips: Trip[]; max: number }) {
  if (!trips.length) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="trips-title">
      <div className="container-x">
        <SectionTitle id="trips-title">{accent(c.title)}</SectionTitle>
        {c.text && <p className="lead mt-4">{c.text}</p>}
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, max).map((t) => <li key={t.id} className="flex"><TripCard t={t} /></li>)}
        </ul>
        <div className="mt-10 flex justify-center">
          <Link href="/vehicles/cars/?mode=Today+trip#all" className="btn-primary h-12 rounded-full px-7 text-[15px]">
            {c.linkLabel || "See all trips"}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
