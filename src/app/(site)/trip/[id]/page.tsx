import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronLeft, Clock, Users } from "lucide-react";
import Photo from "@/components/Photo";
import RequestButton from "@/components/search/RequestButton";
import { RuleChip } from "@/components/TripsList";
import { getSettings, getTrip } from "@/lib/content";
import { tripDay, tripTime } from "@/lib/trips";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ seats?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = (await params).id;
  const t = await getTrip(id);
  if (!t) return { title: "Trip", robots: { index: false, follow: true } };
  return buildMetadata({
    title: `${t.from.split(",")[0]} to ${t.to.split(",")[0]}, ${tripDay(t.date)} ${tripTime(t.time)}`,
    description: `Shared car trip in a ${t.car.name}. ${t.seats} seats left.`,
    path: `/trip/${id}/`,
    noindex: true,
  });
}

/** One shared trip: route with stops, date and time, the car, seats, price, rules and booking. */
export default async function TripPage({ params, searchParams }: Params) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [t, site] = await Promise.all([getTrip(id), getSettings()]);
  if (!t) notFound();
  const full = t.full || t.seats <= 0;
  const want = Math.min(Math.max(1, Number(sp.seats) || 1), Math.max(1, t.seats));
  const stops = [t.from, ...t.via, t.to];
  const entries = [
    { label: "Trip", value: `${t.from} → ${t.to}` },
    { label: "Date", value: `${tripDay(t.date)} (${t.date})` },
    { label: "Time", value: tripTime(t.time) },
    { label: "Car", value: t.car.name },
    { label: "Seats", value: String(want) },
    ...(t.pricePerSeat ? [{ label: "Price per seat", value: `₹${t.pricePerSeat.toLocaleString("en-IN")}` }] : []),
  ];
  return (
    <>
      <div className={`pt-[60px] md:pt-[72px] ${site.heroTheme === "dark" ? "bg-ink-900" : "bg-surface-50"}`} />
      <section className="bg-surface-50 pb-16 pt-3 md:pb-24 md:pt-6">
        <div className="container-x">
          <Link href="/vehicles/cars/?mode=Today+trip#all" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 hover:text-brand-600">
            <ChevronLeft className="h-4 w-4" />Today trips
          </Link>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-8 md:mt-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0">
              <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-white shadow-card">
                {t.car.photo && <Photo photo={t.car.photo} fill priority sizes="(min-width: 1024px) 640px, 100vw" className={`object-cover ${full ? "grayscale" : ""}`} />}
                <span className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-sm font-bold uppercase tracking-wide ${full ? "bg-ink-900 text-white" : "bg-white text-ink-900 shadow-card"}`}>
                  {full ? "Fully booked" : `${t.seats} ${t.seats === 1 ? "seat" : "seats"} left`}
                </span>
              </div>
              <div className="mt-4 rounded-card bg-white p-5 shadow-card ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">The car</p>
                <p className="mt-1 font-head text-xl font-semibold text-ink-900">{t.car.name}</p>
                {t.car.specs.length > 0 && (
                  <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-field border border-line bg-line sm:grid-cols-4">
                    {t.car.specs.slice(0, 4).map((s) => (
                      <div key={s.label} className="bg-white px-4 py-3">
                        <dt className="text-xs text-ink-400">{s.label}</dt>
                        <dd className="mt-0.5 font-semibold text-ink-900">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {t.car.slug && <Link href={`/vehicle/${t.car.slug}/`} className="link mt-4 inline-block text-sm">More about this car</Link>}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Today trip · shared seats</p>
              <h1 className="display mt-1 flex flex-wrap items-center gap-x-3 text-4xl md:text-5xl">
                {t.from.split(",")[0].replace(/\s*\(.*\)/, "")} <ArrowRight className="h-8 w-8 text-brand-500" /> {t.to.split(",")[0]}
              </h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-ink-600">
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-5 w-5 text-brand-500" />{tripDay(t.date)}, {t.date}</span>
                <span className="inline-flex items-center gap-2"><Clock className="h-5 w-5 text-brand-500" />{tripTime(t.time)}</span>
                <span className="inline-flex items-center gap-2"><Users className="h-5 w-5 text-brand-500" />{full ? "No seats left" : `${t.seats} seats left`}</span>
              </div>

              {/* Route: start, stops on the way, end. */}
              <ol className="mt-6 rounded-card bg-white p-5 shadow-card ring-1 ring-black/5">
                {stops.map((s, i) => (
                  <li key={`${s}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < stops.length - 1 && <span aria-hidden className="absolute left-[7px] top-4 h-full w-0.5 bg-brand-100" />}
                    <span aria-hidden className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-[3px] ${i === 0 || i === stops.length - 1 ? "border-brand-500 bg-white" : "border-brand-200 bg-white"}`} />
                    <span>
                      <span className="block font-semibold text-ink-900">{s}</span>
                      <span className="text-xs text-ink-400">{i === 0 ? `Start, ${tripTime(t.time)}` : i === stops.length - 1 ? "Drop" : "Stop on the way"}</span>
                    </span>
                  </li>
                ))}
              </ol>

              {t.rules.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-head text-lg font-semibold text-ink-900">Trip rules</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">{t.rules.map((r) => <RuleChip key={r} rule={r} large />)}</ul>
                </div>
              )}
              {t.notes && <p className="mt-5 rounded-field bg-white p-4 text-sm leading-relaxed text-ink-600 ring-1 ring-line">{t.notes}</p>}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-black/5">
                {t.pricePerSeat ? (
                  <p className="text-sm text-ink-400">
                    <span className="font-head text-3xl font-semibold text-ink-900">₹{t.pricePerSeat.toLocaleString("en-IN")}</span> / seat
                    {want > 1 && <span className="block text-ink-600">₹{(t.pricePerSeat * want).toLocaleString("en-IN")} for {want} seats</span>}
                  </p>
                ) : <p className="text-sm text-ink-600">Price confirmed on WhatsApp.</p>}
                {full ? (
                  <span className="inline-flex h-11 items-center rounded-xl bg-surface-100 px-5 text-sm font-semibold text-ink-400" aria-disabled="true">Fully booked · no seats left</span>
                ) : (
                  <RequestButton title="Today trip seat request" entries={entries} href={`/trip/${t.id}/`} label={want > 1 ? `Book ${want} seats` : "Book a seat"} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
