import Link from "next/link";
import type { Vehicle } from "@/data/vehicles";
import { groupOf } from "@/data/vehicles";
import { site } from "@/config/site";
import { ArrowUpRight } from "lucide-react";

export default function VehicleCard({ v }: { v: Vehicle }) {
  const price = site.showPrices && v.pricePerDay;
  return (
    <Link
      href={`/vehicle/${v.slug}/`}
      className="group flex h-full w-full flex-col rounded-card bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* Fixed aspect ratio container so every image is identically sized */}
      <div className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-b from-[#fbfcfd] to-[#edf0f4] p-3">
        <img
          src={`/vehicles/${v.type}.webp`}
          alt={v.name}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{groupOf(v.group).name}</p>
        <h3 className="mt-1 line-clamp-1 font-head text-xl font-bold text-ink-900" title={v.name}>
          {v.name}
        </h3>

        {/* Standardized min-height for specs so cards with 1 or 2 lines stay equal */}
        <dl className="mt-3 flex min-h-[44px] flex-wrap content-start gap-x-4 gap-y-1.5 text-xs">
          {v.specs.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <dt className="text-ink-400">{s.label}</dt>
              <dd className="font-semibold text-ink-900">{s.value}</dd>
            </div>
          ))}
        </dl>

        {/* Pinned to bottom so every action button lines up across cards */}
        <div className="mt-auto flex items-end justify-between border-t border-line/60 pt-4">
          {price ? (
            <p className="font-head text-2xl font-extrabold text-ink-900">
              from ₹{price.toLocaleString("en-IN")}
              <span className="text-xs font-semibold text-ink-500"> / day</span>
            </p>
          ) : (
            <p className="font-head text-base font-bold text-ink-900">Get quote</p>
          )}
          <span
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white transition-colors group-hover:bg-brand-600"
            aria-hidden
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
