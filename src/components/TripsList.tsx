"use client";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Ban, CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";
import Photo from "./Photo";
import RequestButton from "./search/RequestButton";
import { useSite } from "./SiteProvider";
import { isLive, isRestriction, matchTrips, todayInIndia, tripDay, tripTime, type Trip } from "@/lib/trips";

export type TripTexts = { title: string; empty: string; othersTitle: string };

/**
 * "Today trip" results on the Cars page: trips matching the pickup, drop and date, soonest first.
 * Fully booked trips stay listed, clearly marked, so visitors know there is no vacancy.
 */
export default function TripsList({ trips, search, texts, onClear }: { trips: Trip[]; search: { from?: string; to?: string; date?: string; seats?: number }; texts: TripTexts; onClear: () => void }) {
  const { areas } = useSite();
  const today = todayInIndia();
  // Removal time checked here too, so a trip vanishes on time even if the page was loaded earlier.
  const upcoming = useMemo(() => trips.filter((t) => isLive(t)), [trips]);
  const exact = useMemo(() => matchTrips(upcoming, search, areas), [upcoming, search, areas]);
  const others = useMemo(() => upcoming.filter((t) => !exact.includes(t)), [upcoming, exact]);

  return (
    <div>
      <p className="mt-6 text-sm text-ink-400" aria-live="polite">
        {exact.length} {exact.length === 1 ? "trip" : "trips"}
        {search.from || search.to ? ` ${[search.from && `from ${search.from.split(",")[0]}`, search.to && `to ${search.to.split(",")[0]}`].filter(Boolean).join(" ")}` : ""}
        {search.date ? `, ${tripDay(search.date, today)}` : ""}.
      </p>
      {exact.length ? (
        <TripGrid trips={exact} seats={search.seats} />
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line p-10 text-center">
          <p className="font-head text-xl font-semibold text-ink-900">{texts.title}</p>
          <p className="mx-auto mt-2 max-w-[60ch]">{texts.empty}</p>
          <button type="button" className="btn-secondary mt-5" onClick={onClear}>Clear search</button>
        </div>
      )}
      {others.length > 0 && (
        <>
          <h3 className="mt-14 font-head text-xl font-semibold text-ink-900 md:text-2xl">{texts.othersTitle}</h3>
          <TripGrid trips={others} seats={search.seats} />
        </>
      )}
    </div>
  );
}

function TripGrid({ trips, seats }: { trips: Trip[]; seats?: number }) {
  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((t) => <li key={t.id} className="flex"><TripCard t={t} seats={seats} /></li>)}
    </ul>
  );
}

export function TripCard({ t, seats = 1 }: { t: Trip; seats?: number }) {
  const full = t.full || t.seats <= 0;
  const want = Math.max(1, seats);
  const route = [t.from, ...t.via, t.to].join(" → ");
  const entries = [
    { label: "Trip", value: `${t.from} → ${t.to}` },
    { label: "Date", value: `${tripDay(t.date)} (${t.date})` },
    { label: "Time", value: tripTime(t.time) },
    { label: "Car", value: t.car.name },
    { label: "Seats", value: String(want) },
    ...(t.pricePerSeat ? [{ label: "Price per seat", value: `₹${t.pricePerSeat.toLocaleString("en-IN")}` }] : []),
  ];
  return (
    <article className={`relative flex w-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-black/5 transition-all duration-300 ${full ? "opacity-80" : "hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200"}`}>
      {/* The whole card opens the trip's details; the Book button sits above this link. */}
      <Link href={`/trip/${t.id}/${want > 1 ? `?seats=${want}` : ""}`} className="absolute inset-0 z-0" aria-label={`Trip details: ${t.from} to ${t.to}, ${tripDay(t.date)} ${tripTime(t.time)}`} />
      <div className="pointer-events-none relative aspect-[16/9] bg-surface-50">
        {t.car.photo && <Photo photo={t.car.photo} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw" className={`object-cover ${full ? "grayscale" : ""}`} />}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${full ? "bg-ink-900 text-white" : "bg-white text-ink-900 shadow-card"}`}>
          {full ? "Fully booked" : `${t.seats} ${t.seats === 1 ? "seat" : "seats"} left`}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-2 font-head text-lg font-semibold text-ink-900">
          {t.from.split(",")[0]} <ArrowRight className="h-4 w-4 text-brand-500" /> {t.to.split(",")[0]}
        </p>
        {t.via.length > 0 && <p className="mt-1 flex items-start gap-1.5 text-xs text-ink-400"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{route}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-brand-500" />{tripDay(t.date)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-500" />{tripTime(t.time)}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-500" />{t.car.name}</span>
        </div>
        {t.rules.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {t.rules.slice(0, 4).map((r) => <RuleChip key={r} rule={r} />)}
            {t.rules.length > 4 && <li className="rounded-full bg-surface-50 px-2.5 py-1 text-xs font-medium text-ink-600">+{t.rules.length - 4} more</li>}
          </ul>
        )}
        <div className="relative z-10 mt-auto flex items-end justify-between gap-3 pt-5">
          {t.pricePerSeat ? (
            <p className="text-sm text-ink-400"><span className="font-head text-2xl font-semibold text-ink-900">₹{t.pricePerSeat.toLocaleString("en-IN")}</span> / seat</p>
          ) : <span className="text-sm font-semibold text-ink-700">View details</span>}
          {full ? (
            <span className="inline-flex h-11 items-center rounded-xl bg-surface-100 px-4 text-sm font-semibold text-ink-400" aria-disabled="true">No seats left</span>
          ) : (
            <RequestButton title="Today trip seat request" entries={entries} href={`/trip/${t.id}/`} label={want > 1 ? `Book ${want} seats` : "Book a seat"} />
          )}
        </div>
      </div>
    </article>
  );
}

/** A trip rule: "No smoking" with a ban icon, "AC" with a tick. */
export function RuleChip({ rule, large = false }: { rule: string; large?: boolean }) {
  const no = isRestriction(rule);
  const Icon = no ? Ban : Check;
  return (
    <li className={`inline-flex items-center gap-1.5 rounded-full font-medium ${large ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs"} ${no ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
      <Icon className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />{rule}
    </li>
  );
}
