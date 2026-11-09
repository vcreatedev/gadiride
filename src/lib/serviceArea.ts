import { ALL_CITIES, LOCATION_OPTIONS } from "@/data/cities";
import type { GroupId } from "@/data/vehicles";

/**
 * Every vehicle has a Location (a city). A search shows the vehicles based in the pickup's city.
 * Anything we cannot place counts as Hyderabad, so an unlisted locality never hides the fleet by mistake.
 */

/** The pickup field of each vehicle search form. */
export const PICKUP_FIELD: Record<GroupId, string> = { cars: "pickup", passenger: "pickup", logistics: "from", equipment: "site" };

/** Names that always mean the Hyderabad metro area (towns in the city list that are part of it, the airport). */
const METRO = ["hyderabad", "secunderabad", "cyberabad", "shamshabad", "medchal", "rgia", "rajiv gandhi international"];

/** States other than Telangana, as they appear in place names. */
const OTHER_STATES = [
  "andhra pradesh", "karnataka", "tamil nadu", "maharashtra", "kerala", "odisha", "chhattisgarh", "goa", "gujarat",
  "madhya pradesh", "uttar pradesh", "rajasthan", "west bengal", "bihar", "jharkhand", "punjab", "haryana", "delhi",
  "puducherry", "assam", "uttarakhand", "himachal pradesh", "jammu", "kashmir",
];

const has = (text: string, name: string) => new RegExp(`(^|[^a-z])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(text);

/**
 * The city a place is in, lower case: "hyderabad" for the metro area (its localities, Secunderabad and
 * the airport), else the listed town or other state it names, else `fallback` ("hyderabad"). Empty place = "".
 */
/**
 * True when a searched place is in a vehicle's (or driver's) area: the place names the area
 * ("Bhanugudi Junction, Kakinada" and "Bhanugudi Junction"), or the area names the place's first part.
 */
export function inArea(place: string | undefined, area: string | undefined): boolean {
  const text = (place ?? "").toLowerCase().trim();
  const a = (area ?? "").toLowerCase().trim();
  if (!text || !a) return false;
  if (has(text, a)) return true;
  const first = text.split(",")[0].trim();
  return first.length > 2 && has(a, first);
}

export function placeCity(place: string | undefined, areas: string[] = [], fallback = "hyderabad"): string {
  const text = (place ?? "").toLowerCase().trim();
  if (!text) return "";
  if (METRO.some((n) => has(text, n)) || areas.some((a) => a && has(text, a.toLowerCase()))) return "hyderabad";
  const town = ALL_CITIES.find((c) => !METRO.includes(c.name.toLowerCase()) && has(text, c.name.toLowerCase()));
  if (town) return town.name.toLowerCase();
  return OTHER_STATES.find((s) => has(text, s)) ?? fallback;
}

/** The admin Location choice for a place or town name ("Kakinada (Urban)" -> "Kakinada"), if it is one of ours. */
export function cityOption(place?: string): string | undefined {
  const city = placeCity(place, [], "");
  return city ? LOCATION_OPTIONS.find((o) => o.toLowerCase() === city) : undefined;
}
