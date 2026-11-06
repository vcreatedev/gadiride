import type { ArtId } from "./vehicleArt";
import type { Photo } from "@/lib/images";

/**
 * SAMPLE FLEET DATA for Hyderabad. Replace with the confirmed list in Sanity.
 * Car prices are sample per-day rates; other groups show "Get quote" until priced.
 */
export type GroupId = "cars" | "passenger" | "logistics" | "equipment";

export const GROUPS: { id: GroupId; name: string; short: string; blurb: string; art: ArtId; color: string }[] = [
  { id: "cars", name: "Cars", short: "Cars", blurb: "Self drive and chauffeur-driven car rental in Hyderabad. Hatchbacks from ₹1,199 a day, with doorstep and airport delivery.", art: "sedan", color: "#FFC20E" },
  { id: "passenger", name: "Passenger vehicles", short: "Passenger", blurb: "Tempo travellers, minibuses and buses for groups, events and staff transport.", art: "van", color: "#E9EBEF" },
  { id: "logistics", name: "Logistics vehicles", short: "Trucks", blurb: "Pickups and trucks for shops, businesses and house shifting.", art: "truck", color: "#F47A16" },
  { id: "equipment", name: "Heavy equipment", short: "Heavy equipment", blurb: "Backhoe loaders (JCB) for construction and site work, with or without an operator.", art: "jcb", color: "#FFC20E" },
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
  { id: "truck", name: "Truck", group: "logistics", art: "truck", color: "#F47A16" },
  { id: "jcb", name: "Backhoe loader", group: "equipment", art: "jcb", color: "#FFC20E" },
];

export type Spec = { label: string; value: string };

/** Raw vehicle entry (sample data and Sanity both map into `Vehicle`). */
export type VehicleSeed = {
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
  featured?: boolean;
  sample?: boolean;
};

export type PhotoFit = "contain" | "cover";
export type PhotoBg = "studio" | "white" | "dark" | "brand";

/** Display-ready vehicle. */
export type Vehicle = VehicleSeed & {
  groupName: string;
  typeName: string;
  photo: Photo;
  /** False when the photo is the type's stock photo. */
  ownPhoto: boolean;
  gallery: Photo[];
  fit: PhotoFit;
  bg: PhotoBg;
  zoom: number;
};

export type Group = { id: GroupId; name: string; short: string; blurb: string; art: ArtId; color: string; photo?: Photo; heroPhoto?: Photo };
export type VType = VehicleType & { photo: Photo };

export type HeroVariant = { art: ArtId; color: string };

/**
 * Vehicles that take turns in each service page's hero (every 30s).
 * Each list uses vehicles from that service and never repeats a colour.
 */
export const HERO_VARIANTS: Record<GroupId | "driver", HeroVariant[]> = {
  cars: [
    { art: "sedan", color: "#FFC20E" },
    { art: "suv", color: "#2E2E34" },
    { art: "hatch", color: "#E8540C" },
    { art: "sedan", color: "#F4F5F7" },
    { art: "suv", color: "#1F4E79" },
    { art: "hatch", color: "#B91C1C" },
  ],
  passenger: [
    { art: "van", color: "#E9EBEF" },
    { art: "bus", color: "#FFC20E" },
    { art: "van", color: "#F47A16" },
    { art: "bus", color: "#1F4E79" },
    { art: "van", color: "#2E2E34" },
  ],
  logistics: [
    { art: "truck", color: "#F47A16" },
    { art: "pickup", color: "#B7BBC2" },
    { art: "truck", color: "#1F4E79" },
    { art: "pickup", color: "#B91C1C" },
    { art: "truck", color: "#2F7D4F" },
  ],
  equipment: [
    { art: "jcb", color: "#FFC20E" },
    { art: "jcb", color: "#F47A16" },
    { art: "jcb", color: "#2F7D4F" },
    { art: "jcb", color: "#B91C1C" },
  ],
  driver: [
    { art: "sedan", color: "#FFC20E" },
    { art: "sedan", color: "#2E2E34" },
    { art: "sedan", color: "#F4F5F7" },
    { art: "sedan", color: "#1F4E79" },
    { art: "sedan", color: "#7F1D1D" },
  ],
};

export const defaultTypePhoto = (id: string, alt?: string): Photo => ({ src: `/vehicles/${id}.webp`, alt });

export const VEHICLES: VehicleSeed[] = [
  {
    slug: "maruti-wagon-r", name: "Maruti Wagon R", type: "hatchback", group: "cars", art: "hatch", color: "#C9CDD3",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "CNG" }],
    summary: "Tall, roomy and very cheap to run on CNG. The easy pick for city errands.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1199, sample: true,
  },
  {
    slug: "maruti-swift", featured: true, name: "Maruti Swift", type: "hatchback", group: "cars", art: "hatch", color: "#B91C1C",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol" }],
    summary: "Peppy, easy to park and loved for weekend drives out of Hyderabad.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1399, sample: true,
  },
  {
    slug: "maruti-baleno", name: "Maruti Baleno", type: "hatchback", group: "cars", art: "hatch", color: "#1F4E79",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol" }],
    summary: "A premium hatchback with a big boot for city trips and short getaways.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1449, sample: true,
  },
  {
    slug: "hyundai-grand-i10-nios", name: "Hyundai Grand i10 Nios", type: "hatchback", group: "cars", art: "hatch", color: "#DADDE2",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol / CNG" }],
    summary: "Light steering and a smooth ride for daily office runs.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1499, sample: true,
  },
  {
    slug: "hyundai-i20", name: "Hyundai i20", type: "hatchback", group: "cars", art: "hatch", color: "#F4F5F7",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol" }],
    summary: "Feature-rich and comfortable, with a touchscreen and rear AC vents.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1749, sample: true,
  },
  {
    slug: "maruti-dzire", name: "Maruti Dzire", type: "sedan", group: "cars", art: "sedan", color: "#DADDE2",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol / CNG" }],
    summary: "A practical sedan with a proper boot for airport runs from RGIA.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1599, sample: true,
  },
  {
    slug: "honda-city", featured: true, name: "Honda City", type: "sedan", group: "cars", art: "sedan", color: "#2E2E34",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Automatic" }, { label: "Fuel", value: "Petrol" }],
    summary: "Spacious, refined and automatic. Great for business trips and family drives.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 2499, sample: true,
  },
  {
    slug: "hyundai-venue", name: "Hyundai Venue", type: "suv", group: "cars", art: "suv", color: "#F47A16",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol" }],
    summary: "A compact SUV that handles Hyderabad traffic and highways with ease.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 1799, sample: true,
  },
  {
    slug: "kia-sonet", name: "Kia Sonet", type: "suv", group: "cars", art: "suv", color: "#2B2D31",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol" }],
    summary: "Stylish compact SUV with a sunroof on select cars.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 2099, sample: true,
  },
  {
    slug: "maruti-ertiga", featured: true, name: "Maruti Ertiga", type: "suv", group: "cars", art: "suv", color: "#F4F5F7",
    specs: [{ label: "Seats", value: "7" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Petrol / CNG" }],
    summary: "Seven seats and good mileage. The family favourite for temple trips and outstation travel.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 2299, sample: true,
  },
  {
    slug: "kia-seltos", featured: true, name: "Kia Seltos", type: "suv", group: "cars", art: "suv", color: "#1F4E79",
    specs: [{ label: "Seats", value: "5" }, { label: "Transmission", value: "Automatic" }, { label: "Fuel", value: "Petrol" }],
    summary: "Premium mid-size SUV with an automatic gearbox for relaxed long drives.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 2999, sample: true,
  },
  {
    slug: "mahindra-thar", featured: true, name: "Mahindra Thar", type: "suv", group: "cars", art: "suv", color: "#14532D",
    specs: [{ label: "Seats", value: "4" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Diesel" }],
    summary: "Open-road fun and 4x4 grip for weekend trips to Ananthagiri and beyond.", options: ["Self drive", "With driver", "Unlimited km"], pricePerDay: 3499, sample: true,
  },
  {
    slug: "toyota-innova-crysta", featured: true, name: "Toyota Innova Crysta", type: "suv", group: "cars", art: "suv", color: "#E9EBEF",
    specs: [{ label: "Seats", value: "7" }, { label: "Transmission", value: "Manual" }, { label: "Fuel", value: "Diesel" }],
    summary: "The trusted seven-seater for outstation trips, with an experienced driver.", options: ["With driver", "Unlimited km"], pricePerDay: 3999, sample: true,
  },
  {
    slug: "toyota-fortuner", name: "Toyota Fortuner", type: "luxury", group: "cars", art: "suv", color: "#141518",
    specs: [{ label: "Seats", value: "7" }, { label: "Transmission", value: "Automatic" }, { label: "Fuel", value: "Diesel" }],
    summary: "A chauffeur-driven full-size SUV for weddings, guests and VIP travel.", options: ["With driver"], pricePerDay: 6499, sample: true,
  },
  {
    slug: "tempo-traveller-12", featured: true, name: "Tempo traveller, 12 seats", type: "tempo", group: "passenger", art: "van", color: "#E9EBEF",
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
    slug: "box-truck-19ft", featured: true, name: "Box truck, 19 ft", type: "truck", group: "logistics", art: "truck", color: "#F47A16",
    specs: [{ label: "Payload", value: "Up to 7 t" }, { label: "Body", value: "Closed container" }, { label: "Use", value: "Goods, shifting" }],
    summary: "Covered transport for furniture, goods and inter-city loads.", options: ["With driver", "Loading help on request"], sample: true,
  },
  {
    slug: "backhoe-loader", featured: true, name: "Backhoe loader (JCB)", type: "jcb", group: "equipment", art: "jcb", color: "#FFC20E",
    specs: [{ label: "Work", value: "Dig, load, level" }, { label: "Billing", value: "Hourly or daily" }, { label: "Operator", value: "Available" }],
    summary: "Foundations, trenching, loading and site clearing. Hire by the hour or the day.", options: ["With operator", "Without operator"], sample: true,
  },
];

export const groupOf = (id: GroupId) => GROUPS.find((g) => g.id === id)!;
export const typeOf = (id: string) => TYPES.find((t) => t.id === id);
