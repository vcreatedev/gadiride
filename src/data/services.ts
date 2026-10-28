import type { ArtId } from "./vehicleArt";

export type Service = {
  id: string;
  name: string;
  forWho: string;
  offer: string;
  points: string[];
  cta: string;
  form: FormKey;
  art: ArtId;
  color: string;
  /** Marked when the client still needs to confirm the details. */
  toConfirm?: boolean;
};
export type FormKey = "cars" | "passenger" | "logistics" | "equipment" | "corporate" | "driver" | "careers";

export const SERVICES: Service[] = [
  {
    id: "car-rental", name: "Car rental", forWho: "Individuals, families and travellers",
    offer: "Hatchbacks to luxury cars for a day, a week or longer.",
    points: ["Self drive or with a driver", "Local, outstation and airport trips", "Daily and monthly rentals"],
    cta: "Get car quote", form: "cars", art: "sedan", color: "#DADDE2",
  },
  {
    id: "passenger-transport", name: "Passenger transport", forWho: "Groups, weddings, tours and staff transport",
    offer: "Tempo travellers, minibuses and buses with experienced drivers.",
    points: ["Weddings and family functions", "Pilgrimages and tours", "Daily staff pickup and drop"],
    cta: "Get vehicle quote", form: "passenger", art: "bus", color: "#F4F5F7",
  },
  {
    id: "logistics", name: "Logistics and goods transport", forWho: "Shops, businesses and house shifting",
    offer: "Pickups and trucks for local and inter-city loads.",
    points: ["Open and closed body options", "Loading help on request", "Single trips or regular runs"],
    cta: "Get truck quote", form: "logistics", art: "truck", color: "#F2611D",
  },
  {
    id: "heavy-equipment", name: "Heavy equipment hire", forWho: "Contractors, builders and site owners",
    offer: "Backhoe loaders (JCB) for digging, loading and levelling.",
    points: ["Hourly or daily hire", "With or without operator", "Other machines on request"],
    cta: "Get equipment quote", form: "equipment", art: "jcb", color: "#F2B705",
  },
  {
    id: "corporate", name: "Corporate transport and fleet", forWho: "Companies and institutions",
    offer: "Long-term and bulk vehicles for staff, guests and operations.",
    points: ["Monthly and annual arrangements", "Mixed fleets across categories", "One contact for every request"],
    cta: "Send corporate enquiry", form: "corporate", art: "suv", color: "#2B2D31",
  },
  {
    id: "driver-services", name: "Driver services", forWho: "Customers who need a driver",
    offer: "A driver for your own vehicle or for one of ours.",
    points: ["Local and outstation", "Short and long term", "Details confirmed on WhatsApp"],
    cta: "Ask about a driver", form: "driver", art: "hatch", color: "#C9CDD3", toConfirm: true,
  },
];

export const CAREER_ROLES = [
  { role: "Drivers", detail: "Car, tempo traveller and bus drivers with a valid licence." },
  { role: "Heavy vehicle drivers", detail: "Truck and goods vehicle drivers." },
  { role: "Equipment operators", detail: "Backhoe loader (JCB) operators." },
  { role: "Office and operations", detail: "Bookings, coordination and fleet support." },
];
