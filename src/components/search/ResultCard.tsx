import Link from "next/link";
import { Check } from "lucide-react";
import BookActions from "../BookActions";
import VehiclePhoto from "../VehiclePhoto";
import type { Vehicle } from "@/data/vehicles";
import type { Entry } from "@/lib/whatsapp";

/** A search result: photo, key specs, options and a one-tap request with the trip details. */
export default function ResultCard({
  v,
  title,
  entries,
  detailsLabel,
  showPrices,
  priority,
  days = 1,
}: {
  /** Booking length; shows the total next to the per-day price. */
  days?: number;
  v: Vehicle;
  title: string;
  entries: Entry[];
  detailsLabel: string;
  showPrices: boolean;
  priority?: boolean;
}) {
  const price = showPrices && v.pricePerDay;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-lift">
      <Link href={`/vehicle/${v.slug}/`} className="block" tabIndex={-1} aria-hidden>
        <VehiclePhoto
          photo={v.photo}
          fit={v.fit}
          bg={v.bg}
          zoom={v.zoom}
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] w-full"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{v.typeName}</p>
            <h3 className="mt-0.5 truncate font-head text-xl font-semibold text-ink-900"><Link href={`/vehicle/${v.slug}/`} className="hover:text-brand-600">{v.name}</Link></h3>
          </div>
          {price ? (
            <p className="shrink-0 text-right font-head text-lg font-semibold text-ink-900">
              ₹{price.toLocaleString("en-IN")}
              <span className="text-[11px] font-medium text-ink-400"> / day</span>
              {days > 1 && (
                <span className="block text-[12px] font-semibold text-brand-700">
                  ₹{(price * days).toLocaleString("en-IN")} for {days} days
                </span>
              )}
            </p>
          ) : (
            <p className="shrink-0 text-right text-[12px] font-semibold text-ink-400">Price on request</p>
          )}
        </div>

        {v.specs.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {v.specs.slice(0, 3).map((s) => (
              <div key={s.label} className="rounded-xl bg-surface-50 px-3 py-2">
                <dt className="truncate text-[11px] text-ink-400">{s.label}</dt>
                <dd className="truncate text-sm font-semibold text-ink-900">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {v.options.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {v.options.map((o) => (
              <li key={o} className="inline-flex items-center gap-1 text-[13px] text-ink-600">
                <Check className="h-3.5 w-3.5 text-ok" />{o}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-5">
          <BookActions title={title} vehicle={v.name} entries={entries} />
          <Link href={`/vehicle/${v.slug}/`} className="mt-3 block text-center text-sm font-semibold text-ink-600 underline-offset-4 hover:text-brand-600 hover:underline">
            {detailsLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
