import type { GroupId, Vehicle } from "@/data/vehicles";
import { PICKUP_FIELD, isOutsideServiceArea } from "./serviceArea";
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
 * `outside`: the pickup place is outside Hyderabad, so nothing is offered.
 */
export function matchVehicles(
  tab: GroupId,
  values: Record<string, string>,
  vehicles: Vehicle[],
  areas: string[] = [],
): { exact: Vehicle[]; others: Vehicle[]; upsized: boolean; outside: boolean } {
  if (isOutsideServiceArea(values[PICKUP_FIELD[tab]], areas)) return { exact: [], others: [], upsized: false, outside: true };
  const inGroup = vehicles.filter((v) => v.group === tab);
  const tests: ((v: Vehicle) => boolean)[] = [];
  const need = Number(values.passengers) || 0;

  if (tab === "cars") {
    const bigger = biggerThanCars(need, vehicles);
    if (bigger) return { exact: bigger, others: [], upsized: true, outside: false };
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
  return { exact, others: inGroup.filter((v) => !exact.includes(v)), upsized: false, outside: false };
}

/** Available drivers; ones in the pickup city and who drive the chosen vehicle come first. */
export function matchDrivers(values: Record<string, string>, drivers: Driver[]) {
  const where = (values.location || "").toLowerCase();
  const kind = (values.drives || "").toLowerCase();
  const score = (d: Driver) =>
    (d.city && where.includes(d.city.toLowerCase()) ? 2 : 0) + (kind && d.drives.some((x) => x.toLowerCase().includes(kind)) ? 1 : 0);
  return [...drivers].sort((a, b) => score(b) - score(a));
}

export const SEARCH_CTA: Record<TabId, string> = {
  cars: "Search cars",
  passenger: "Find vehicles",
  logistics: "Find trucks",
  equipment: "Find machines",
  driver: "Find drivers",
};
