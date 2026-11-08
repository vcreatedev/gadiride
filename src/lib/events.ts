import type { GroupId } from "@/data/vehicles";
export const TAB_EVENT = "ga:tab";
/** A search run on the vehicle page it lists (the page filters its own list, no reload). */
export const SEARCH_EVENT = "ga:search";
/** A search cleared, from the list or from the search bar; the other one resets too. */
export const CLEAR_EVENT = "ga:search-clear";
export function announceClear(from: "list" | "bar") {
  window.dispatchEvent(new CustomEvent(CLEAR_EVENT, { detail: from }));
}
export function announceSearch(values: Record<string, string>) {
  window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: values }));
}
/** A search value changed from the vehicle list (e.g. passengers + / -); the search bar shows it too. */
export const TRIP_EVENT = "ga:trip";
export function announceTrip(values: Record<string, string>) {
  window.dispatchEvent(new CustomEvent(TRIP_EVENT, { detail: values }));
}
export function selectTab(tab: GroupId | "driver", preset?: Record<string, string>) {
  window.dispatchEvent(new CustomEvent(TAB_EVENT, { detail: { tab, preset } }));
}
