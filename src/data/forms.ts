import type { FormKey } from "./services";

export type Field = {
  name: string;
  label: string;
  type: "text" | "date" | "time" | "select" | "segment" | "number" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** Column span on desktop (out of 12). */
  span?: 3 | 4 | 6 | 12;
  /** Date must be on or after this other date field. */
  notBefore?: string;
  min?: number;
  max?: number;
  defaultValue?: string;
  /** Only show when another field has this value. */
  showIf?: { field: string; equals: string };
};

export type FormDef = { key: FormKey; title: string; cta: string; fields: Field[] };

export const FORMS: Record<FormKey, FormDef> = {
  cars: {
    key: "cars", title: "Car rental request", cta: "Get car quote",
    fields: [
      { name: "mode", label: "Rental type", type: "segment", options: ["Self drive", "With driver"], defaultValue: "Self drive", span: 4 },
      { name: "carType", label: "Car type", type: "select", options: ["Any", "Hatchback", "Sedan", "SUV", "Luxury"], defaultValue: "Any", span: 4 },
      { name: "differentDrop", label: "Drop location", type: "segment", options: ["Same as pickup", "Different"], defaultValue: "Same as pickup", span: 4 },
      { name: "pickup", label: "Pickup location", type: "text", required: true, placeholder: "Area, landmark or airport", span: 6 },
      { name: "drop", label: "Drop location", type: "text", required: true, placeholder: "Where will you return the car?", span: 6, showIf: { field: "differentDrop", equals: "Different" } },
      { name: "pickupDate", label: "Pickup date", type: "date", required: true, span: 3 },
      { name: "pickupTime", label: "Pickup time", type: "time", required: true, defaultValue: "10:00", span: 3 },
      { name: "returnDate", label: "Return date", type: "date", required: true, notBefore: "pickupDate", span: 3 },
      { name: "returnTime", label: "Return time", type: "time", required: true, defaultValue: "10:00", span: 3 },
    ],
  },
  passenger: {
    key: "passenger", title: "Passenger vehicle request", cta: "Get vehicle quote",
    fields: [
      { name: "tripType", label: "Trip type", type: "segment", options: ["Local", "Outstation", "Round trip"], defaultValue: "Local", span: 6 },
      { name: "vehicle", label: "Vehicle", type: "select", options: ["Any", "Tempo traveller", "Minibus", "Bus"], defaultValue: "Any", span: 3 },
      { name: "passengers", label: "Passengers", type: "number", min: 1, max: 60, defaultValue: "12", required: true, span: 3 },
      { name: "pickup", label: "Pickup location", type: "text", required: true, placeholder: "Area or landmark", span: 6 },
      { name: "destination", label: "Destination", type: "text", required: true, placeholder: "City or venue", span: 6 },
      { name: "date", label: "Date", type: "date", required: true, span: 6 },
      { name: "time", label: "Time", type: "time", required: true, defaultValue: "08:00", span: 6 },
    ],
  },
  logistics: {
    key: "logistics", title: "Goods transport request", cta: "Get truck quote",
    fields: [
      { name: "goods", label: "What are you moving?", type: "select", options: ["Household items", "Shop stock", "Construction material", "Machinery", "Other"], defaultValue: "Household items", span: 4 },
      { name: "weight", label: "Approx. weight", type: "select", options: ["Under 1 tonne", "1 to 3 tonnes", "3 to 7 tonnes", "Over 7 tonnes", "Not sure"], defaultValue: "Not sure", span: 4 },
      { name: "loading", label: "Loading help", type: "segment", options: ["Needed", "Not needed"], defaultValue: "Not needed", span: 4 },
      { name: "from", label: "Pickup address", type: "text", required: true, placeholder: "Area, city", span: 6 },
      { name: "to", label: "Drop address", type: "text", required: true, placeholder: "Area, city", span: 6 },
      { name: "date", label: "Date", type: "date", required: true, span: 12 },
    ],
  },
  equipment: {
    key: "equipment", title: "Heavy equipment request", cta: "Get equipment quote",
    fields: [
      { name: "machine", label: "Machine", type: "select", options: ["Backhoe loader (JCB)", "Other (describe in notes)"], defaultValue: "Backhoe loader (JCB)", span: 4 },
      { name: "operator", label: "Operator", type: "segment", options: ["With operator", "Without operator"], defaultValue: "With operator", span: 4 },
      { name: "durationUnit", label: "Hire by", type: "segment", options: ["Hours", "Days"], defaultValue: "Hours", span: 4 },
      { name: "site", label: "Site location", type: "text", required: true, placeholder: "Village, area or city", span: 6 },
      { name: "start", label: "Start date", type: "date", required: true, span: 3 },
      { name: "duration", label: "Duration", type: "number", min: 1, max: 999, defaultValue: "8", required: true, span: 3 },
    ],
  },
  corporate: {
    key: "corporate", title: "Corporate enquiry", cta: "Send corporate enquiry",
    fields: [
      { name: "company", label: "Company", type: "text", required: true, placeholder: "Company name", span: 6 },
      { name: "service", label: "Service", type: "select", options: ["Staff transport", "Guest and executive cars", "Long-term fleet", "Goods transport", "Heavy equipment", "Mixed needs"], defaultValue: "Staff transport", span: 6 },
      { name: "fleet", label: "Vehicles needed", type: "text", required: true, placeholder: "e.g. 3 SUVs and 1 bus", span: 6 },
      { name: "route", label: "Pickup and destination", type: "text", placeholder: "Optional", span: 6 },
      { name: "start", label: "Required from", type: "date", required: true, span: 6 },
      { name: "notes", label: "Details", type: "textarea", placeholder: "Duration, timings, anything else", span: 12 },
    ],
  },
  driver: {
    key: "driver", title: "Driver request", cta: "Ask about a driver",
    fields: [
      { name: "vehicle", label: "Whose vehicle?", type: "segment", options: ["My vehicle", "Gadiride vehicle"], defaultValue: "My vehicle", span: 6 },
      { name: "trip", label: "Trip", type: "segment", options: ["Local", "Outstation"], defaultValue: "Local", span: 6 },
      { name: "location", label: "Pickup location", type: "text", required: true, placeholder: "Area or landmark", span: 6 },
      { name: "date", label: "Date", type: "date", required: true, span: 6 },
      { name: "notes", label: "Details", type: "textarea", placeholder: "Vehicle type, duration, timings", span: 12 },
    ],
  },
  careers: {
    key: "careers", title: "Job enquiry", cta: "Send my details",
    fields: [
      { name: "role", label: "Role", type: "select", options: ["Driver", "Heavy vehicle driver", "Equipment operator", "Office and operations", "Other"], defaultValue: "Driver", span: 6 },
      { name: "experience", label: "Experience (years)", type: "number", min: 0, max: 50, defaultValue: "1", span: 6 },
      { name: "city", label: "City", type: "text", required: true, placeholder: "Where do you live?", span: 6 },
      { name: "licence", label: "Driving licence", type: "segment", options: ["Yes", "No"], defaultValue: "Yes", span: 6 },
      { name: "notes", label: "About you", type: "textarea", placeholder: "Vehicles you can drive, languages, availability", span: 12 },
    ],
  },
};
