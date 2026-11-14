/**
 * Ready-made choices for the vehicle form: the specification list (with common values), quick-add
 * options, the starting short description, and the rules for the page address (slug).
 * Plain data and functions, shared by the form inputs and the admin lists.
 */
import type { GroupId } from "@/data/vehicles";

export type SpecPreset = { label: string; hint: string; values?: string[] };

const YES_NO = ["Yes", "No"];

/** Specifications offered in the "Add specification" list, per vehicle group, most used first. */
export const SPEC_PRESETS: Record<GroupId, SpecPreset[]> = {
  cars: [
    { label: "Seats", hint: "e.g. 5", values: ["4", "5", "7", "8"] },
    { label: "Fuel", hint: "e.g. Petrol", values: ["Petrol", "Diesel", "CNG", "Petrol / CNG", "Electric"] },
    { label: "Transmission", hint: "e.g. Manual", values: ["Manual", "Automatic"] },
    { label: "Mileage", hint: "e.g. 20 km/l or CNG: 31 km/kg" },
    { label: "AC", hint: "e.g. Yes", values: YES_NO },
    { label: "Boot space", hint: "e.g. 2 big bags" },
    { label: "Airbags", hint: "e.g. 2", values: ["2", "4", "6"] },
    { label: "Model year", hint: "e.g. 2024" },
  ],
  passenger: [
    { label: "Seats", hint: "e.g. 12 + driver", values: ["12 + driver", "17 + driver", "26 + driver", "40 + driver"] },
    { label: "AC", hint: "e.g. Yes", values: YES_NO },
    { label: "Luggage", hint: "e.g. Roof carrier", values: ["Roof carrier", "Rear boot", "Under-floor storage"] },
    { label: "Use", hint: "e.g. Events, staff, tours", values: ["Group trips", "Events, staff, tours", "Temple tours"] },
    { label: "Pushback seats", hint: "e.g. Yes", values: YES_NO },
    { label: "Fuel", hint: "e.g. Diesel", values: ["Diesel", "CNG"] },
    { label: "Mileage", hint: "e.g. 10 km/l" },
  ],
  logistics: [
    { label: "Payload", hint: "e.g. Up to 1 t", values: ["Up to 1 t", "Up to 3 t", "Up to 7 t", "Up to 10 t"] },
    { label: "Body", hint: "e.g. Closed container", values: ["Open", "Closed container"] },
    { label: "Deck", hint: "e.g. Open", values: ["Open", "Flatbed"] },
    { label: "Length", hint: "e.g. 14 ft", values: ["8 ft", "14 ft", "19 ft", "22 ft"] },
    { label: "Use", hint: "e.g. Local delivery", values: ["Local delivery", "Goods, shifting", "Inter-city loads"] },
    { label: "Fuel", hint: "e.g. Diesel", values: ["Diesel", "CNG"] },
    { label: "Mileage", hint: "e.g. 12 km/l" },
  ],
  equipment: [
    { label: "Work", hint: "e.g. Dig, load, level", values: ["Dig, load, level", "Trenching", "Site clearing"] },
    { label: "Billing", hint: "e.g. Hourly or daily", values: ["Hourly or daily", "Hourly", "Daily"] },
    { label: "Operator", hint: "e.g. Available", values: ["Available", "Included", "Not included"] },
    { label: "Bucket size", hint: "e.g. 1 cubic metre" },
    { label: "Fuel use", hint: "e.g. 5 litres/hour" },
  ],
};

const GROUP_IDS = Object.keys(SPEC_PRESETS) as GroupId[];
const isGroup = (g: unknown): g is GroupId => typeof g === "string" && GROUP_IDS.includes(g as GroupId);
const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The specification list for a group; every group's list (no repeats) while no group is picked. */
export function specPresets(group: unknown): SpecPreset[] {
  if (isGroup(group)) return SPEC_PRESETS[group];
  const all = GROUP_IDS.flatMap((g) => SPEC_PRESETS[g]);
  return all.filter((p, i) => all.findIndex((q) => sameText(q.label, p.label)) === i);
}

/** Hint and common values for a label (also for a label from another group, e.g. "Fuel" on a bus). */
export function presetFor(label: string | undefined, group: unknown): SpecPreset | undefined {
  if (!label?.trim()) return undefined;
  const own = isGroup(group) ? SPEC_PRESETS[group] : [];
  return [...own, ...specPresets(undefined)].find((p) => sameText(p.label, label));
}

/**
 * The specification rows a new vehicle starts with (values left to fill; empty rows are not shown on
 * the website). Same order as the existing vehicles, so the first three on cards match theirs.
 */
const CORE_SPECS = ["Seats", "Transmission", "Fuel", "Mileage"];
const DEFAULT_SPECS: Record<GroupId, string[]> = {
  cars: CORE_SPECS,
  passenger: CORE_SPECS,
  logistics: ["Payload", "Transmission", "Fuel", "Mileage"],
  equipment: ["Work", "Billing", "Fuel use"],
};

export const defaultSpecLabels = (group: unknown): string[] => DEFAULT_SPECS[isGroup(group) ? group : "cars"];

const newKey = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

/** Rows for a new vehicle's Specifications: the usual labels, each with its own key. */
export const defaultSpecs = (group: unknown) => defaultSpecLabels(group).map((label) => ({ _type: "spec", _key: newKey(), label }));

/** Options offered as quick-add buttons, per group (the website shows them as ticks on the vehicle page). */
export const OPTION_PRESETS: Record<GroupId, string[]> = {
  cars: ["Self drive", "With driver", "Unlimited km", "Doorstep delivery", "Airport delivery"],
  passenger: ["With driver", "Unlimited km"],
  logistics: ["With driver", "Loading help on request"],
  equipment: ["With operator", "Without operator"],
};

export const optionPresets = (group: unknown): string[] => (isGroup(group) ? OPTION_PRESETS[group] : OPTION_PRESETS.cars);

/** The short description a new vehicle starts with (the admin edits it). Under the 220-character limit. */
const SUMMARIES: Record<GroupId, string> = {
  cars: "Easy to drive and park, great mileage for city trips. 5 seats, AC, music system.",
  passenger: "Comfortable for group trips, temple tours and family functions. AC, pushback seats and space for luggage.",
  logistics: "Reliable goods transport for shop stock, house shifting and inter-city loads. Driver included.",
  equipment: "Ready for digging, loading and site clearing, with an experienced operator. Hire by the hour or the day.",
};

export const defaultSummary = (group: unknown): string => SUMMARIES[isGroup(group) ? group : "cars"];

/** A page address made from a name: "Maruti Swift (VXI)" -> "maruti-swift-vxi". */
export function slugify(text: string, maxLength = 80): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  return (cut.includes("-") ? cut.slice(0, cut.lastIndexOf("-")) : cut).replace(/-+$/g, "");
}

/** Lower-case letters and digits joined by single dashes: safe in a link. */
export const isValidSlug = (slug: unknown): slug is string => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

/** Whether `slug` was made from a name that gives `base` ("maruti-swift" or "maruti-swift-2"). */
export const isMadeFrom = (slug: string, base: string): boolean => slug === base || new RegExp(`^${base}-\\d+$`).test(slug);

/** `base`, or `base-2`, `base-3`... whichever is not used yet. */
export function freeSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
