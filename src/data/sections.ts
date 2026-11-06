/**
 * Sections that editors can reorder or hide in Sanity ("Section order" on a page).
 * The page hero always stays at the top; everything below follows this order.
 */
export type SectionSlot = { key: string; show: boolean };

export const HOME_SECTIONS = [
  { key: "marquee", title: "Scrolling offers strip" },
  { key: "services", title: "Everything on wheels (services overview)" },
  { key: "offers", title: "Offers & deals" },
  { key: "popular", title: "Popular right now" },
  { key: "areas", title: "Hyderabad areas" },
  { key: "why", title: "Why rent with us" },
  { key: "how", title: "How booking works" },
  { key: "reviews", title: "Reviews" },
  { key: "partner", title: "Attach your vehicle" },
  { key: "corporate", title: "Corporate" },
  { key: "faq", title: "FAQ" },
  { key: "final", title: "Final call to action" },
] as const;

export const VEHICLE_PAGE_SECTIONS = [
  { key: "marquee", title: "Scrolling offers strip" },
  { key: "offers", title: "Offers for you" },
  { key: "vehicles", title: "Vehicle list" },
  { key: "areas", title: "Hyderabad areas (Cars page only)" },
  { key: "faq", title: "FAQ" },
] as const;

export const defaultSlots = (list: readonly { key: string }[]): SectionSlot[] => list.map((s) => ({ key: s.key, show: true }));

/**
 * The keys to render, in the editor's order. Hidden ones are dropped, unknown keys are ignored,
 * and any section missing from the saved list (e.g. one added to the site later) is appended,
 * so a new section never silently disappears.
 */
export function orderSections(saved: SectionSlot[] | undefined, list: readonly { key: string }[]): string[] {
  const known = new Set(list.map((s) => s.key));
  const rows = (saved ?? []).filter((s) => s && known.has(s.key));
  const seen = new Set(rows.map((s) => s.key));
  const all = [...rows, ...list.filter((s) => !seen.has(s.key)).map((s) => ({ key: s.key, show: true }))];
  return all.filter((s) => s.show !== false).map((s) => s.key);
}
