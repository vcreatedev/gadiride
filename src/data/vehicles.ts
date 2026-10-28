import type { ArtId } from "./vehicleArt";

/**
 * SAMPLE FLEET DATA. Replace with the client's confirmed list.
 * Prices are intentionally empty: cards show "Get quote" until real prices exist.
 */
export type GroupId = "cars" | "passenger" | "logistics" | "equipment";

export const GROUPS: { id: GroupId; name: string; short: string; blurb: string; art: ArtId; color: string }[] = [
  { id: "cars", name: "Cars", short: "Cars", blurb: "Hatchbacks, sedans, SUVs and luxury cars. Self drive or with a driver.", art: "suv", color: "#2B2D31" },
  { id: "passenger", name: "Passenger vehicles", short: "Passenger", blurb: "Tempo travellers, minibuses and buses for groups, events and staff transport.", art: "van", color: "#E9EBEF" },
  { id: "logistics", name: "Logistics vehicles", short: "Trucks", blurb: "Pickups and trucks for shops, businesses and house shifting.", art: "truck", color: "#F2611D" },
  { id: "equipment", name: "Heavy equipment", short: "Heavy equipment", blurb: "Backhoe loaders (JCB) for construction and site work, with or without an operator.", art: "jcb", color: "#F2B705" },
];

export type VehicleType = { id: string; name: string; group: GroupId; art: ArtId; color: string };

export const TYPES: VehicleType[] = [
  { id: "hatchback", name: "Hatchback", group: "cars", art: "hatch", color: "#C9CDD3" },
  { id: "sedan", name: "Sedan", group: "cars", art: "sedan", color: "#DADDE2" },
  { id: "suv", name: "SUV", group: "cars", art: "suv", color: "#2B2D31" },
  { id: "luxury", name: "Luxury", group: "cars", art: "sedan", color: "#141518" },
  { id: "tempo", name: "Tempo traveller", group: "passenger", art: "van", color: "#E9EBEF" },
  { id: "bus", name: "Bus", group: "passenger", art: "bus", color: "#F4F5F7" },
  { id: "pickup", name: "Pickup", group: "logistics", art: "pickup", color: "#B7BBC2" },
  { id: "truck", name: "Truck", group: "logistics", art: "truck", color: "#F2611D" },
  { id: "jcb", name: "Backhoe loader", group: "equipment", art: "jcb", color: "#F2B705" },
];

export type Spec = { label: string; value: string };

export type Vehicle = {
  slug: string;
  name: string;
  type: string;
  group: GroupId;
  art: ArtId;
  color: string;
  specs: Spec[];
  summary: string;
  options: string[];
  /** INR per day. Leave undefined until the client confirms. */
  pricePerDay?: number;
  sample: true;
};

export const VEHICLES: Vehicle[] = [
  {
    slug: "compact-hatchback", name: "Compact hatchback", type: "hatchback", group: "cars", art: "hatch", color: "#C9CDD3",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol" }],
    summary: "Easy to park and light on fuel. Suits city errands and short trips.", options: ["Self drive", "With driver"], sample: true,
  },
  {
    slug: "executive-sedan", name: "Executive sedan", type: "sedan", group: "cars", art: "sedan", color: "#DADDE2",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Automatic" }, { label: "Fuel", value: "Petrol" }],
    summary: "A comfortable boot and quiet cabin for airport runs and outstation travel.", options: ["Self drive", "With driver"], sample: true,
  },
  {
    slug: "seven-seater-suv", name: "7-seater SUV", type: "suv", group: "cars", art: "suv", color: "#2B2D31",
    specs: [{ label: "Seats", value: "7" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Diesel" }],
    summary: "Room for the whole family and luggage, with the clearance for highways and hill roads.", options: ["Self drive", "With driver"], sample: true,
  },
  {
    slug: "luxury-sedan", name: "Luxury sedan", type: "luxury", group: "cars", art: "sedan", color: "#141518",
    specs: [{ label: "Seats", value: "4" }, { label: "Transmission", value: "Automatic" }, { label: "Fuel", value: "Diesel" }],
    summary: "For weddings, guests and business travel. Chauffeur driven.", options: ["With driver"], sample: true,
  },
  {
    slug: "tempo-traveller-12", name: "Tempo traveller, 12 seats", type: "tempo", group: "passenger", art: "van", color: "#E9EBEF",
    specs: [{ label: "Seats", value: "12 + driver" }, { label: "AC", value: "Yes" }, { label: "Luggage", value: "Roof carrier" }],
    summary: "Group trips, temple tours and family functions in one vehicle.", options: ["With driver"], sample: true,
  },
  {
    slug: "coach-bus-40", name: "Coach bus, 40 seats", type: "bus", group: "passenger", art: "bus", color: "#F4F5F7",
    specs: [{ label: "Seats", value: "40" }, { label: "AC", value: "Yes" }, { label: "Use", value: "Events, staff, tours" }],
    summary: "Move large groups for weddings, corporate events and staff transport.", options: ["With driver"], sample: true,
  },
  {
    slug: "pickup-1t", name: "Pickup, 1 tonne", type: "pickup", group: "logistics", art: "pickup", color: "#B7BBC2",
    specs: [{ label: "Payload", value: "Up to 1 t" }, { label: "Deck", value: "Open" }, { label: "Use", value: "Local delivery" }],
    summary: "Quick local deliveries, shop stock and small house moves.", options: ["With driver", "Loading help on request"], sample: true,
  },
  {
    slug: "box-truck-19ft", name: "Box truck, 19 ft", type: "truck", group: "logistics", art: "truck", color: "#F2611D",
    specs: [{ label: "Payload", value: "Up to 7 t" }, { label: "Body", value: "Closed container" }, { label: "Use", value: "Goods, shifting" }],
    summary: "Covered transport for furniture, goods and inter-city loads.", options: ["With driver", "Loading help on request"], sample: true,
  },
  {
    slug: "backhoe-loader", name: "Backhoe loader (JCB)", type: "jcb", group: "equipment", art: "jcb", color: "#F2B705",
    specs: [{ label: "Work", value: "Dig, load, level" }, { label: "Billing", value: "Hourly or daily" }, { label: "Operator", value: "Available" }],
    summary: "Foundations, trenching, loading and site clearing. Hire by the hour or the day.", options: ["With operator", "Without operator"], sample: true,
  },
];

export const groupOf = (id: GroupId) => GROUPS.find((g) => g.id === id)!;
export const typeOf = (id: string) => TYPES.find((t) => t.id === id);
