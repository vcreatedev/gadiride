import { ALL_CITIES } from "@/data/cities";
import type { GroupId } from "@/data/vehicles";

/**
 * Gadiride serves Hyderabad only. A search whose pickup place is clearly elsewhere (another town in
 * our city list, or another state) gets no vehicles. Anything we cannot place counts as Hyderabad, so
 * an unlisted locality never hides the fleet by mistake.
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

/** True only when the place is known to be outside Hyderabad. Empty = not chosen yet = fine. */
export function isOutsideServiceArea(place: string | undefined, areas: string[] = []): boolean {
  const text = (place ?? "").toLowerCase().trim();
  if (!text) return false;
  if (METRO.some((n) => has(text, n)) || areas.some((a) => a && has(text, a.toLowerCase()))) return false;
  if (OTHER_STATES.some((s) => has(text, s))) return true;
  return ALL_CITIES.some((c) => !METRO.includes(c.name.toLowerCase()) && has(text, c.name.toLowerCase()));
}
