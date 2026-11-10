import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { placeLabel, type Vehicle } from "@/data/vehicles";
import { FORMS } from "@/data/forms";
import VehiclePhoto from "./VehiclePhoto";
import BookActions from "./BookActions";

/** Fleet card: photo, name, key specs, per-day price, and WhatsApp / Call booking buttons. */
export default function VehicleCard({ v, priority = false }: { v: Vehicle; priority?: boolean }) {
  const price = v.pricePerDay;
  const href = `/vehicle/${v.slug}/`;
  return (
    <article className="group relative flex h-full w-full cursor-pointer flex-col rounded-card bg-white p-3 shadow-card ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200">
      {/* The whole card opens the vehicle page; WhatsApp and Call sit above this link. */}
      {/* No background preloading: many cards scroll past, and a visitor opens one. */}
      <Link href={href} prefetch={false} className="absolute inset-0 z-0 rounded-card" aria-label={`${v.name} details`} />
      <div className="pointer-events-none block">
        <VehiclePhoto
          photo={v.photo}
          fit={v.fit}
          bg={v.bg}
          zoom={v.zoom}
          priority={priority}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
          className="aspect-[16/10] w-full shrink-0 rounded-[18px]"
        />
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
              {v.typeName}
              <span className="inline-flex items-center gap-0.5 normal-case tracking-normal text-ink-400"><MapPin aria-hidden className="h-3 w-3" />{placeLabel(v)}</span>
            </p>
            <h3 className="mt-1 line-clamp-1 font-head text-xl font-semibold text-ink-900" title={v.name}>
              <span className="group-hover:text-brand-600">{v.name}</span>
            </h3>
          </div>
          <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-50 text-ink-900 ring-1 ring-line transition-colors group-hover:bg-brand-gradient group-hover:text-white group-hover:ring-transparent">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <dl className="mt-3 flex min-h-[20px] flex-wrap content-start gap-x-4 gap-y-1.5 text-xs">
          {v.specs.slice(0, 3).map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <dt className="text-ink-400">{s.label}</dt>
              <dd className="font-semibold text-ink-900">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-4">
          <div className="flex min-h-[40px] items-baseline justify-between border-t border-line/60 pt-3">
            {price ? (
              <p className="font-head text-2xl font-semibold text-ink-900">
                ₹{price.toLocaleString("en-IN")}
                <span className="text-xs font-semibold text-ink-400"> / day</span>
              </p>
            ) : (
              <p className="font-head text-base font-semibold text-ink-900">Price on request</p>
            )}
            <span className="text-sm font-semibold text-ink-600 underline-offset-4 group-hover:text-brand-600 group-hover:underline">Details</span>
          </div>
          <BookActions title={FORMS[v.group].title} vehicle={v.name} details={v} className="relative z-10 mt-3" />
        </div>
      </div>
    </article>
  );
}
