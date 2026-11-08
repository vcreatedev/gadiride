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
  /** Only show when another field has this value (or one of these values). */
  showIf?: { field: string; equals: string | string[] };
  /** false = not shown in the search bar (still in full forms). */
  bar?: false;
};

export type FormDef = { key: FormKey; title: string; cta: string; fields: Field[] };

export const FORMS: Record<FormKey, FormDef> = {
  cars: {
    key: "cars", title: "Car rental request", cta: "Get car quote",
    fields: [
      { name: "mode", label: "Rental type", type: "segment", options: ["Self drive", "With driver", "Today trip"], defaultValue: "Self drive", span: 4 },
      { name: "carType", label: "Car type", type: "select", options: ["Any", "Hatchback", "Sedan", "SUV", "Luxury"], defaultValue: "Any", span: 4, bar: false },
      // Self drive: book by number of days. With driver: a trip with drop-off and return.
      // Seats needed: matching cars, or tempo travellers and buses when no car is big enough.
      { name: "passengers", label: "No. of passengers", type: "number", min: 1, max: 60, defaultValue: "4", required: true, span: 4 },
      { name: "pickup", label: "Pickup location", type: "text", required: true, placeholder: "Area or airport", span: 6 },
      { name: "drop", label: "Drop-off location", type: "text", placeholder: "Same as pickup", span: 6, showIf: { field: "mode", equals: ["With driver", "Today trip"] } },
      { name: "pickupDate", label: "Pickup date", type: "date", required: true, span: 3 },
      { name: "pickupTime", label: "Pickup time", type: "time", required: true, defaultValue: "10:00", span: 3, showIf: { field: "mode", equals: ["Self drive", "With driver"] } },
      { name: "returnDate", label: "Return date", type: "date", required: true, notBefore: "pickupDate", span: 3, showIf: { field: "mode", equals: "With driver" } },
      { name: "returnTime", label: "Return time", type: "time", required: true, defaultValue: "20:00", span: 3, showIf: { field: "mode", equals: "With driver" } },
    ],
  },
  passenger: {
    key: "passenger", title: "Passenger vehicle request", cta: "Get vehicle quote",
    fields: [
      { name: "tripType", label: "Trip type", type: "segment", options: ["Local", "Outstation", "Round trip"], defaultValue: "Local", span: 6 },
      { name: "vehicle", label: "Vehicle", type: "select", options: ["Any", "Tempo traveller", "Minibus", "Bus"], defaultValue: "Any", span: 3, bar: false },
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
      { name: "route", label: "Trip", type: "segment", options: ["Within city", "Intercity"], defaultValue: "Within city", span: 4, bar: false },
      { name: "goods", label: "Goods", type: "select", options: ["Household items", "Shop stock", "Construction material", "Machinery", "Other"], defaultValue: "Household items", span: 4, bar: false },
      { name: "weight", label: "Weight", type: "select", options: ["Under 1 tonne", "1 to 3 tonnes", "3 to 7 tonnes", "Over 7 tonnes", "Not sure"], defaultValue: "Not sure", span: 4 },
      { name: "helpers", label: "Loading helpers", type: "number", min: 0, max: 10, defaultValue: "0", span: 4 },
      { name: "from", label: "Pickup address", type: "text", required: true, placeholder: "Area, city", span: 6 },
      { name: "to", label: "Drop address", type: "text", required: true, placeholder: "Area, city", span: 6 },
      { name: "date", label: "Date", type: "date", required: true, span: 6 },
      { name: "time", label: "Time", type: "time", required: true, defaultValue: "09:00", span: 6 },
    ],
  },
  equipment: {
    key: "equipment", title: "Heavy equipment request", cta: "Get equipment quote",
    fields: [
      { name: "machine", label: "Machine", type: "select", options: ["Backhoe loader (JCB)", "Other (describe in notes)"], defaultValue: "Backhoe loader (JCB)", span: 4, bar: false },
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
      { name: "vehicle", label: "Whose vehicle?", type: "segment", options: ["My vehicle", "Gadiride vehicle"], defaultValue: "My vehicle", span: 4 },
      { name: "trip", label: "Trip", type: "segment", options: ["Local", "Outstation"], defaultValue: "Local", span: 4 },
      { name: "drives", label: "Vehicle", type: "select", options: ["Car", "SUV", "Tempo traveller", "Bus", "Truck"], defaultValue: "Car", span: 4 },
      { name: "location", label: "Pickup location", type: "text", required: true, placeholder: "Area or landmark", span: 6 },
      { name: "date", label: "Date", type: "date", required: true, span: 3 },
      { name: "time", label: "Time", type: "time", required: true, defaultValue: "09:00", span: 3 },
      { name: "notes", label: "Details", type: "textarea", placeholder: "Vehicle type, duration, timings", span: 12 },
    ],
  },
  partner: {
    key: "partner", title: "Attach my vehicle", cta: "Send vehicle details",
    fields: [
      { name: "vehicleType", label: "Vehicle", type: "select", options: ["Hatchback", "Sedan", "SUV", "Luxury car", "Tempo traveller", "Bus", "Pickup", "Truck", "Backhoe loader (JCB)", "Other"], defaultValue: "Sedan", span: 6 },
      { name: "offer", label: "Offer it", type: "segment", options: ["With driver", "Without driver", "Both"], defaultValue: "With driver", span: 6 },
      { name: "model", label: "Make and model", type: "text", required: true, placeholder: "e.g. Toyota Innova Crysta", span: 6 },
      { name: "year", label: "Year", type: "number", min: 1990, max: 2030, defaultValue: "2021", span: 3 },
      { name: "count", label: "How many", type: "number", min: 1, max: 500, defaultValue: "1", span: 3 },
      { name: "city", label: "City", type: "text", required: true, placeholder: "Where is the vehicle?", span: 6 },
      { name: "name", label: "Your name", type: "text", required: true, placeholder: "Owner or company name", span: 6 },
      { name: "notes", label: "Anything else", type: "textarea", placeholder: "Seats, payload, documents, availability", span: 12 },
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

/** What the admin can change on a form: texts, choices, required, order and which fields show. */
export type FormFieldOverride = { name?: string; label?: string; placeholder?: string; options?: string[]; required?: boolean };
export type FormOverride = { title?: string; cta?: string; fields?: FormFieldOverride[] };

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);

/**
 * The form with the admin's changes. Fields keep their code-defined type and rules; the admin's list
 * sets their order (fields it hid are already left out). Fields added in code later are appended.
 */
export function applyFormOverride(base: FormDef, o?: FormOverride | null): FormDef {
  if (!o) return base;
  const listed = (o.fields ?? []).filter((f) => f?.name && base.fields.some((b) => b.name === f.name));
  const fields = listed.length
    ? [
        ...listed.map((f): Field => {
          const b = base.fields.find((x) => x.name === f.name)!;
          const options = Array.isArray(f.options) ? f.options.filter((x) => text(x)) : [];
          return {
            ...b,
            label: text(f.label) ?? b.label,
            placeholder: text(f.placeholder) ?? b.placeholder,
            options: b.options && options.length ? options : b.options,
            required: typeof f.required === "boolean" ? f.required : b.required,
          };
        }),
        ...base.fields.filter((b) => !(o.fields ?? []).some((f) => f?.name === b.name)),
      ]
    : base.fields;
  // A default must still be one of the choices.
  const safe = fields.map((f) => (f.options && f.defaultValue && !f.options.includes(f.defaultValue) ? { ...f, defaultValue: f.options[0] } : f));
  return { ...base, title: text(o.title) ?? base.title, cta: text(o.cta) ?? base.cta, fields: safe };
}

/** A form's fields as the admin starts editing them (seed and defaults). */
export const formOverrideDefaults = (key: FormKey): FormOverride => ({
  title: FORMS[key].title,
  cta: FORMS[key].cta,
  fields: FORMS[key].fields.map(({ name, label, placeholder, options, required }) => ({ name, label, placeholder, options, required: !!required })),
});
