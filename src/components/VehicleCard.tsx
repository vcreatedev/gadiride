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
      className="group flex flex-col rounded-card bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-b from-[#fbfcfd] to-[#edf0f4] p-3">
        <img
          src={`/vehicles/${v.type}.webp`}
          alt={v.name}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <p className="text-sm text-ink-400">{groupOf(v.group).name}</p>
        <h3 className="mt-1 font-head text-xl font-bold text-ink-900">{v.name}</h3>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {v.specs.map((s) => (
            <div key={s.label} className="flex gap-1.5">
              <dt className="text-ink-400">{s.label}</dt>
              <dd className="font-semibold text-ink-900">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex items-end justify-between pt-5">
          {price ? (
            <p className="font-head text-2xl font-extrabold text-ink-900">
              from ₹{price.toLocaleString("en-IN")}
              <span className="text-sm font-semibold text-ink-600"> per day</span>
            </p>
          ) : (
            <p className="font-head text-lg font-bold text-ink-900">Get quote</p>
          )}
          <span
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white transition-colors group-hover:bg-brand-600"
            aria-hidden
          >
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
