import Link from "next/link";
import VehicleSvg from "./VehicleSvg";
import type { Vehicle } from "@/data/vehicles";
import { groupOf } from "@/data/vehicles";
import { site } from "@/config/site";
import { ArrowUpRight } from "lucide-react";

export default function VehicleCard({ v }: { v: Vehicle }) {
  const price = site.showPrices && v.pricePerDay;
  return (
    <Link href={`/vehicle/${v.slug}/`} className="group flex flex-col rounded-card bg-white p-2 shadow-card transition-shadow duration-300 hover:shadow-lift">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[18px] bg-surface-50 px-6">
        <VehicleSvg art={v.art} color={v.color} title={v.name} className="w-full max-h-[70%] transition-transform duration-500 ease-out group-hover:translate-x-2" />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
        <p className="text-sm text-ink-400">{groupOf(v.group).name}</p>
        <h3 className="mt-1 font-head text-xl font-bold">{v.name}</h3>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {v.specs.map((s) => (
            <div key={s.label} className="flex gap-1.5"><dt className="text-ink-400">{s.label}</dt><dd className="font-semibold text-ink-900">{s.value}</dd></div>
          ))}
        </dl>
        <div className="mt-auto flex items-end justify-between pt-6">
          {price ? (
            <p className="font-head text-2xl font-extrabold text-ink-900">from ₹{price.toLocaleString("en-IN")}<span className="text-sm font-semibold text-ink-600"> per day</span></p>
          ) : (
            <p className="font-head text-lg font-bold text-ink-900">Get quote</p>
          )}
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white transition-colors group-hover:bg-brand-600" aria-hidden>
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
