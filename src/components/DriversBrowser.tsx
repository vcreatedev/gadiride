"use client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import DriverCard from "./search/DriverCard";
import type { Driver } from "@/lib/content";
import { FORMS } from "@/data/forms";
import { CLEAR_EVENT, SEARCH_EVENT, announceClear } from "@/lib/events";
import { scrollToTarget } from "@/lib/lenis";
import { pickFormValues, requestEntries } from "@/lib/request";
import { matchDrivers } from "@/lib/search";
import { useSite } from "./SiteProvider";

type Texts = { title: string; empty: string; outsideTitle: string; outsideText: string; requestLabel: string };

/**
 * The Drivers page list. A search from the search bar above filters it here (no separate results
 * page): drivers in the pickup area come first, and a pickup outside Hyderabad shows a friendly note.
 */
export default function DriversBrowser({ drivers, texts }: { drivers: Driver[]; texts: Texts }) {
  const { areas } = useSite();
  const [trip, setTrip] = useState<Record<string, string>>({});

  useEffect(() => {
    setTrip(pickFormValues("driver", Object.fromEntries(new URLSearchParams(window.location.search))));
    const onSearch = (e: Event) => {
      setTrip((e as CustomEvent<Record<string, string>>).detail);
      requestAnimationFrame(() => scrollToTarget("#all"));
    };
    const onClear = (e: Event) => { if ((e as CustomEvent).detail === "bar") setTrip({}); };
    window.addEventListener(SEARCH_EVENT, onSearch);
    window.addEventListener(CLEAR_EVENT, onClear);
    return () => { window.removeEventListener(SEARCH_EVENT, onSearch); window.removeEventListener(CLEAR_EVENT, onClear); };
  }, []);

  // Keep the link in step with the search (shareable, survives a reload).
  useEffect(() => {
    const q = new URLSearchParams(Object.entries(trip).filter(([, v]) => v));
    window.history.replaceState(null, "", `${window.location.pathname}${q.size ? `?${q.toString()}` : ""}${window.location.hash}`);
  }, [trip]);

  const searching = Object.keys(trip).length > 0;
  const matched = useMemo(() => (searching ? matchDrivers(trip, drivers, areas) : drivers), [searching, trip, drivers, areas]);
  // A searched place where no driver is based: the "coming to your city" note instead of an empty list.
  const outside = searching && !!trip.location?.trim() && matched.length === 0 && drivers.length > 0;
  const list = outside ? [] : matched;
  const entries = useMemo(() => (searching ? requestEntries("driver", trip) : []), [searching, trip]);
  const clearSearch = () => { setTrip({}); announceClear("list"); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="font-head text-2xl font-semibold text-ink-900 md:text-3xl">{texts.title}</h2>
        {searching && (
          <button type="button" onClick={clearSearch} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink-700 ring-1 ring-line transition-colors hover:bg-white">
            <X className="h-4 w-4" />Clear search
          </button>
        )}
      </div>
      {list.length ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <li key={d.name}>
              <DriverCard d={d} title={FORMS.driver.title} entries={entries} requestLabel={texts.requestLabel} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line p-10 text-center">
          <p className="font-head text-xl font-semibold text-ink-900">{outside ? texts.outsideTitle : texts.title}</p>
          <p className="mx-auto mt-2 max-w-[60ch]">{outside ? texts.outsideText : texts.empty}</p>
          {searching && <button type="button" className="btn-secondary mt-5" onClick={clearSearch}>Clear search</button>}
        </div>
      )}
    </div>
  );
}
