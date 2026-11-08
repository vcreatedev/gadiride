import type { Photo } from "./images";

/** A shared car trip ("Today trip"): one car, one route, seats to share. */
export type Trip = {
  id: string;
  from: string;
  to: string;
  via: string[];
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  /** When it leaves the website (ISO): "Remove from website at", or the trip's start. */
  endsAt: string;
  seats: number;
  /** Marked "Fully booked" in the admin, or no seats left. */
  full: boolean;
  pricePerSeat?: number;
  notes?: string;
  rules: string[];
  car: { name: string; slug: string; photo?: Photo; specs: { label: string; value: string }[] };
};

/** Rules the admin can tick on a trip. "No …" ones show as not allowed, the rest as allowed / included. */
export const TRIP_RULES = [
  "No smoking",
  "No pets",
  "No alcohol",
  "No food in the car",
  "One bag per person",
  "Pets allowed",
  "AC",
  "Music on request",
  "Women-friendly",
  "Stops for tea and breaks",
];

/** True for rules that say something is not allowed. */
export const isRestriction = (rule: string) => /^no\b/i.test(rule.trim());

/** The value of "Rental type" that searches shared trips. */
export const TRIP_MODE = "Today trip";

/** A trip's removal time: the admin's "Remove from website at", else its start (date + time, India time). */
export const tripEndsAt = (date: string, time?: string, expiresAt?: string) => expiresAt || `${date}T${/^\d\d:\d\d$/.test(time ?? "") ? time : "23:59"}:00+05:30`;

/** Still on the website: its removal time has not passed. */
export const isLive = (t: { endsAt: string }, now = Date.now()) => Date.parse(t.endsAt) > now;

/** Today's date in India (YYYY-MM-DD). */
export const todayInIndia = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);

/**
 * A place reduced to its city: "Kakinada, Andhra Pradesh" -> "kakinada". Any Hyderabad locality
 * (Kukatpally, Ameerpet, the airport...) counts as "hyderabad", so it matches trips from Hyderabad.
 */
export function cityOf(place: string, areas: string[] = []): string {
  const first = place.split(",")[0].replace(/\(.*?\)/g, "").trim().toLowerCase();
  if (!first) return "";
  const inHyderabad = /hyderabad|secunderabad|cyberabad|rgia|shamshabad/.test(first) || areas.some((a) => a && first.includes(a.toLowerCase()));
  return inHyderabad ? "hyderabad" : first;
}

const samePlace = (a: string, b: string) => !!a && !!b && (a === b || a.includes(b) || b.includes(a));

/**
 * Trips for a search, matched by place and date: the pickup must come before the drop on the route
 * (stops on the way count), on the chosen date if one is given. Either place can be left empty.
 * Fully booked trips stay in the results (marked), so visitors know that route is taken.
 */
export function matchTrips(trips: Trip[], q: { from?: string; to?: string; date?: string }, areas: string[] = []) {
  const from = cityOf(q.from ?? "", areas);
  const to = cityOf(q.to ?? "", areas);
  return trips.filter((t) => {
    const stops = [t.from, ...t.via, t.to].map((s) => cityOf(s, areas));
    const a = from ? stops.slice(0, -1).findIndex((s) => samePlace(s, from)) : 0;
    const b = to ? stops.findIndex((s, i) => i > a && samePlace(s, to)) : stops.length - 1;
    if (a < 0 || b < 0) return false;
    return !q.date || t.date === q.date;
  });
}

/** "Today", "Tomorrow" or e.g. "Sat, 14 Nov". */
export function tripDay(date: string, today = todayInIndia()): string {
  if (date === today) return "Today";
  const next = new Date(`${today}T12:00:00+05:30`);
  next.setDate(next.getDate() + 1);
  if (date === todayInIndia(next)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
}

/** "06:30" -> "6:30 AM". */
export function tripTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
