import type { GroupId, Vehicle } from "@/data/vehicles";
import { PICKUP_FIELD, inArea, placeCity } from "./serviceArea";
import { pinOf, withoutPin } from "./pincode";
import type { Driver } from "./content";

export type TabId = GroupId | "driver";
export const TAB_IDS: TabId[] = ["cars", "passenger", "logistics", "equipment", "driver"];

const firstNumber = (s?: string) => {
  const m = s?.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : undefined;
};
const spec = (v: Vehicle, re: RegExp) => v.specs.find((s) => re.test(s.label))?.value;
const hasOption = (v: Vehicle, re: RegExp) => v.options.some((o) => re.test(o));

/** Minimum payload (tonnes) needed for each weight choice in the logistics form. */
const NEED_T: Record<string, number> = { "Under 1 tonne": 0, "1 to 3 tonnes": 1, "3 to 7 tonnes": 3, "Over 7 tonnes": 7 };

const seatsOf = (v: Vehicle) => firstNumber(spec(v, /seat/i));

/**
 * Cars for more people than any car seats: the passenger vehicles (tempo travellers, buses) that
 * fit, smallest first. Undefined while a car is big enough.
 */
function biggerThanCars(need: number, vehicles: Vehicle[]): Vehicle[] | undefined {
  const carSeats = vehicles.filter((v) => v.group === "cars").map(seatsOf).filter((n): n is number => n !== undefined);
  if (!need || !carSeats.length || need <= Math.max(...carSeats)) return undefined;
  return vehicles
    .filter((v) => v.group === "passenger" && (seatsOf(v) ?? 0) >= need)
    .sort((a, b) => (seatsOf(a) ?? 0) - (seatsOf(b) ?? 0));
}

/**
 * Vehicles in the chosen group that satisfy the trip details.
 * Vehicles without the relevant spec are kept (we cannot rule them out).
 * `upsized`: the group was too big for a car, so these are tempo travellers and buses.
 * Only vehicles based in the pickup's city are offered (no pickup yet = all of them).
 * Vehicles in the pickup's area come first (`near` = how many, `nearArea` = that area), then the rest of the city.
 * A pincode in the pickup counts as an area: vehicles with that pincode come first. A pincode with no
 * town named finds its city from the vehicles listed with it (or in its district: same first 3 digits).
 * `outside`: no vehicles of this group are based in that city.
 */
export function matchVehicles(
  tab: GroupId,
  values: Record<string, string>,
  vehicles: Vehicle[],
  areas: string[] = [],
): { exact: Vehicle[]; others: Vehicle[]; upsized: boolean; outside: boolean; near: number; nearArea?: string } {
  const pickup = values[PICKUP_FIELD[tab]];
  const city = searchCity(pickup, vehicles, areas);
  if (city === null) return { exact: [], others: [], upsized: false, outside: true, near: 0 };
  const here = city ? vehicles.filter((v) => placeCity(v.location, areas) === city) : vehicles;
  if (city && !here.some((v) => v.group === tab)) return { exact: [], others: [], upsized: false, outside: true, near: 0 };
  const inGroup = here.filter((v) => v.group === tab);
  const tests: ((v: Vehicle) => boolean)[] = [];
  const need = Number(values.passengers) || 0;

  if (tab === "cars") {
    const bigger = biggerThanCars(need, here);
    if (bigger) return { ...areaFirst(bigger, pickup), others: [], upsized: true, outside: false };
  }

  if (tab === "cars") {
    if (values.carType && values.carType !== "Any") tests.push((v) => v.typeName === values.carType);
    if (values.mode === "With driver") tests.push((v) => !v.options.length || hasOption(v, /driver|chauffeur/i));
    if (values.mode === "Self drive") tests.push((v) => !v.options.length || hasOption(v, /self/i));
    if (need > 0) tests.push((v) => (seatsOf(v) ?? Infinity) >= need);
  }
  if (tab === "passenger") {
    if (values.vehicle && values.vehicle !== "Any") tests.push((v) => v.typeName === values.vehicle);
    if (need > 0) tests.push((v) => (seatsOf(v) ?? Infinity) >= need);
  }
  if (tab === "logistics") {
    const need = NEED_T[values.weight];
    if (need) tests.push((v) => (firstNumber(spec(v, /payload|capacity|load/i)) ?? Infinity) > need);
  }
  if (tab === "equipment") {
    if (values.operator === "With operator") tests.push((v) => !v.options.length || hasOption(v, /with operator|operator available/i) || /operator/i.test(v.specs.map((s) => s.label + s.value).join(" ")));
    if (values.operator === "Without operator") tests.push((v) => !v.options.length || hasOption(v, /without operator/i));
  }

  const exact = inGroup.filter((v) => tests.every((t) => t(v)));
  return { ...areaFirst(exact, pickup), others: inGroup.filter((v) => !exact.includes(v)), upsized: false, outside: false };
}

/**
 * The searched city: a town named in the place, else the city of the vehicles at its pincode (or in its
 * district), else Hyderabad. Null when only a pincode was given and no vehicle is anywhere near it.
 */
function searchCity(place: string | undefined, vehicles: { location: string; pincode?: string }[], areas: string[]): string | null {
  const pin = pinOf(place);
  const named = placeCity(withoutPin(place), areas, "");
  if (named || !pin) return named || placeCity(place, areas);
  const at = vehicles.find((v) => v.pincode === pin) ?? vehicles.find((v) => v.pincode?.slice(0, 3) === pin.slice(0, 3));
  return at ? placeCity(at.location, areas) : null;
}

/** The vehicles in the searched place's area (or at its pincode) first (same order otherwise), then the rest. */
function areaFirst(list: Vehicle[], place: string | undefined) {
  const pin = pinOf(place);
  const near = list.filter((v) => inArea(withoutPin(place), v.area) || (!!pin && v.pincode === pin));
  return { exact: [...near, ...list.filter((v) => !near.includes(v))], near: near.length, nearArea: near[0]?.area ?? (near.length ? pin : undefined) };
}

/**
 * Drivers for a search, the same way as vehicles: only those based in the pickup's city (a pincode
 * alone finds its city from the drivers listed with it); ones in the pickup's area or at its pincode
 * first, then those who drive the chosen vehicle. Empty when no driver is based in that city.
 */
export function matchDrivers(values: Record<string, string>, drivers: Driver[], areas: string[] = []) {
  const where = values.location || "";
  const kind = (values.drives || "").toLowerCase();
  const city = searchCity(where, drivers, areas);
  if (city === null) return [];
  const inCity = city ? drivers.filter((d) => placeCity(d.location, areas) === city) : drivers;
  const pin = pinOf(where);
  const near = (d: Driver) => inArea(withoutPin(where), d.area) || (!!pin && d.pincode === pin);
  const score = (d: Driver) => (near(d) ? 2 : 0) + (kind && d.drives.some((x) => x.toLowerCase().includes(kind)) ? 1 : 0);
  return [...inCity].sort((a, b) => score(b) - score(a));
}

export const SEARCH_CTA: Record<TabId, string> = {
  cars: "Search cars",
  passenger: "Find vehicles",
  logistics: "Find trucks",
  equipment: "Find machines",
  driver: "Find drivers",
};
