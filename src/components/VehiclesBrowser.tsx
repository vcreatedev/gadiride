"use client";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Minus, Plus, X } from "lucide-react";
import type { GroupId, Vehicle } from "@/data/vehicles";
import { FORMS, applyFormOverride } from "@/data/forms";
import { CLEAR_EVENT, SEARCH_EVENT, announceClear, announceTrip } from "@/lib/events";
import { scrollToTarget } from "@/lib/lenis";
import { pickFormValues, withFormDefaults } from "@/lib/request";
import { matchVehicles } from "@/lib/search";
import { useCatalog, useSearchBar, useSite } from "./SiteProvider";
import VehicleCard from "./VehicleCard";
import CategoryIcon from "./CategoryIcon";
import { accent } from "./Accent";
import TripsList, { type TripTexts } from "./TripsList";
import { TRIP_MODE, type Trip } from "@/lib/trips";

/**
 * Filterable listing. Filters are kept in the URL query so results can be shared. On a vehicle
 * page, a search from the search bar filters this list too (seats, rental type...); groups too big
 * for a car get the tempo travellers and buses that fit, in the same list.
 */
type EmptyText = { title: string; text: string; outsideTitle?: string; outsideText?: string };

type Props = {
  vehicles: Vehicle[];
  lockGroup?: GroupId;
  empty: EmptyText;
  /** List heading, e.g. "Pick your car." */
  title?: string;
  /** Heading when a big group gets tempo travellers and buses instead, e.g. "Pick your ride." */
  mixedTitle?: string;
  /** Cars only: shared trips, shown when the search's rental type is "Today trip". */
  trips?: Trip[];
  tripTexts?: TripTexts & { heading: string };
};

export default function VehiclesBrowser({ vehicles, lockGroup, empty, title, mixedTitle, trips, tripTexts }: Props) {
  const { areas } = useSite();
  const { groups: GROUPS, types: TYPES } = useCatalog();
  const [group, setGroup] = useState<GroupId | "all">(lockGroup ?? "all");
  const [type, setType] = useState<string>("all");
  const [loc, setLoc] = useState<string>("all");
  // The search bar's values for this page (only what the visitor changed).
  const [trip, setTrip] = useState<Record<string, string>>({});
  const formEdits = useSearchBar().forms;
  const fields = useMemo(() => (lockGroup ? applyFormOverride(FORMS[lockGroup], formEdits[lockGroup]).fields : []), [lockGroup, formEdits]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!lockGroup) {
      const g = p.get("group");
      if (g && GROUPS.some((x) => x.id === g)) setGroup(g as GroupId);
    }
    const t = p.get("type") || window.location.hash.slice(1);
    if (t && TYPES.some((x) => x.id === t)) setType(t);
    const l = p.get("location");
    if (l) setLoc(l);
    if (lockGroup) setTrip(pickFormValues(lockGroup, Object.fromEntries(p)));
  }, [lockGroup, GROUPS, TYPES]);

  // A search on this same page: filter here and bring the list into view.
  useEffect(() => {
    const h = (e: Event) => {
      setTrip((e as CustomEvent<Record<string, string>>).detail);
      setType("all");
      setLoc("all"); // the pickup place decides the city
      requestAnimationFrame(() => scrollToTarget("#all"));
    };
    window.addEventListener(SEARCH_EVENT, h);
    // "Clear all" in the search bar empties this list's search too.
    const c = (e: Event) => { if ((e as CustomEvent).detail === "bar") { setTrip({}); setType("all"); } };
    window.addEventListener(CLEAR_EVENT, c);
    return () => { window.removeEventListener(SEARCH_EVENT, h); window.removeEventListener(CLEAR_EVENT, c); };
  }, []);

  /** Clears this list's search and the search bar's fields. */
  const clearSearch = () => { setTrip({}); setType("all"); announceClear("list"); };

  useEffect(() => {
    const p = new URLSearchParams();
    if (!lockGroup && group !== "all") p.set("group", group);
    if (type !== "all") p.set("type", type);
    if (loc !== "all") p.set("location", loc);
    Object.entries(trip).forEach(([k, v]) => v && p.set(k, v));
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [group, type, loc, lockGroup, trip]);

  const searching = Object.keys(trip).length > 0;
  const tripValues = useMemo(() => withFormDefaults(fields, trip), [fields, trip]);
  const match = useMemo(() => (lockGroup && searching ? matchVehicles(lockGroup, tripValues, vehicles, areas) : null), [lockGroup, searching, tripValues, vehicles, areas]);
  const passengers = Number(tripValues.passengers) || 0;
  const forWhom = !searching ? "" : passengers ? ` for ${passengers} ${passengers === 1 ? "passenger" : "passengers"}` : " for your trip";
  const heading = match?.upsized && mixedTitle ? mixedTitle : title;
  // Passengers + / -: searches again right away and updates the search bar.
  const seatField = fields.find((f) => f.name === "passengers");
  const minSeats = Number(seatField?.min ?? 1);
  const maxSeats = Number(seatField?.max ?? 60);
  const setPassengers = (n: number) => {
    const v = String(Math.min(maxSeats, Math.max(minSeats, n)));
    setTrip((t) => ({ ...t, passengers: v }));
    announceTrip({ passengers: v });
  };
  const types = match?.upsized ? [] : TYPES.filter((t) => (group === "all" || t.group === group) && vehicles.some((v) => v.type === t.id));
  // Cities with vehicles in this list; the chips show only when there is more than one.
  const locations = useMemo(
    () => [...new Set(vehicles.filter((v) => group === "all" || v.group === group).map((v) => v.location))].sort((a, b) => a.localeCompare(b)),
    [vehicles, group],
  );
  const atLoc = !searching && loc !== "all" && locations.includes(loc) ? loc : "all";
  const list = useMemo(
    () =>
      (match ? match.exact : vehicles).filter(
        (v) => (match?.upsized || group === "all" || v.group === group) && (match?.upsized || type === "all" || v.type === type) && (atLoc === "all" || v.location === atLoc),
      ),
    [match, vehicles, group, type, atLoc],
  );
  const sample = vehicles.some((v) => v.sample);

  // "Today trip": shared trips for the searched pickup, drop and date instead of the car list.
  if (trips && tripTexts && searching && tripValues.mode === TRIP_MODE) {
    const tripSearch = { from: trip.pickup, to: trip.drop, date: trip.pickupDate, seats: Number(trip.passengers) || 1 };
    return (
      <div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h2 className="h2">{accent(tripTexts.heading)}</h2>
          <button type="button" onClick={clearSearch} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink-700 ring-1 ring-line transition-colors hover:bg-white">
            <X className="h-4 w-4" />Clear search
          </button>
        </div>
        <TripsList trips={trips} search={tripSearch} texts={tripTexts} onClear={clearSearch} />
      </div>
    );
  }

  return (
    <div>
      {heading && <h2 className="h2 mb-8">{accent(heading)}</h2>}
      {!lockGroup && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Vehicle group">
          {[{ id: "all" as const, short: "All" }, ...GROUPS].map((g) => (
            <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => { setGroup(g.id); setType("all"); }} className={`chip ${group === g.id ? "chip-on" : ""}`}>
              {g.id !== "all" && <CategoryIcon id={g.id} className="h-4 w-5" />}{g.short}
            </button>
          ))}
        </div>
      )}
      {types.length > 1 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Vehicle type">
          {[{ id: "all", name: "All types" }, ...types].map((t) => (
            <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => setType(t.id)} className={`chip h-9 ${type === t.id ? "chip-on" : ""}`}>{t.name}</button>
          ))}
        </div>
      )}
      {!searching && locations.length > 1 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Location">
          {["all", ...locations].map((l) => (
            <button key={l} type="button" aria-pressed={atLoc === l} onClick={() => setLoc(l)} className={`chip h-9 ${atLoc === l ? "chip-on" : ""}`}>
              {l === "all" ? "All locations" : <><MapPin aria-hidden className="h-3.5 w-3.5" />{l}</>}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm text-ink-400" aria-live="polite">
          {list.length} {list.length === 1 ? "vehicle" : "vehicles"}{atLoc !== "all" ? ` in ${atLoc}` : ""}{forWhom}.{match?.near && match.nearArea ? ` ${match.near} in ${match.nearArea} shown first.` : ""} {sample ? "Sample list, availability" : "Availability"} confirmed on request.
        </p>
        {searching && seatField && passengers > 0 && (
          <div className="inline-flex h-8 items-center gap-1 rounded-lg px-1 text-sm ring-1 ring-line" role="group" aria-label="Passengers">
            <button type="button" onClick={() => setPassengers(passengers - 1)} disabled={passengers <= minSeats} aria-label="Fewer passengers" className="grid h-6 w-6 place-items-center rounded-md text-ink-700 transition-colors hover:bg-white disabled:opacity-40">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[6.5rem] text-center font-semibold text-ink-900" aria-live="polite">{passengers} {passengers === 1 ? "passenger" : "passengers"}</span>
            <button type="button" onClick={() => setPassengers(passengers + 1)} disabled={passengers >= maxSeats} aria-label="More passengers" className="grid h-6 w-6 place-items-center rounded-md text-ink-700 transition-colors hover:bg-white disabled:opacity-40">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
        {searching && (
          <button type="button" onClick={clearSearch} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink-700 ring-1 ring-line transition-colors hover:bg-white">
            <X className="h-4 w-4" />Clear search
          </button>
        )}
      </div>
      {list.length ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v, i) => (
            <li key={v.slug} className="flex h-full">
              <VehicleCard v={v} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line p-10 text-center">
          {/* Pickup outside Hyderabad: say so instead of the usual "nothing listed". */}
          <p className="font-head text-xl font-semibold text-ink-900">{match?.outside ? empty.outsideTitle ?? empty.title : empty.title}</p>
          <p className="mt-2">{match?.outside ? empty.outsideText ?? empty.text : empty.text}</p>
          <button type="button" className="btn-secondary mt-5" onClick={() => { setGroup(lockGroup ?? "all"); setLoc("all"); clearSearch(); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
