import { FORMS, type Field } from "@/data/forms";
import type { FormKey } from "@/data/services";
import { isVisible } from "./schema";
import type { Entry } from "./whatsapp";

export const fmtDate = (v: string) => {
  if (!v) return "";
  const d = new Date(v + "T00:00:00");
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

export const fmtTime = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  if (Number.isNaN(h)) return v;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

/** Turns form values into readable label/value lines for the WhatsApp message and the search summary. */
export function requestEntries(formKey: FormKey, values: Record<string, string>, fields: Field[] = FORMS[formKey].fields): Entry[] {
  return fields
    .filter((f) => isVisible(f, values) && values[f.name])
    .filter((f) => f.name !== "durationUnit")
    .map((f) => ({
      label: f.label,
      value:
        f.type === "date"
          ? fmtDate(values[f.name])
          : f.type === "time"
          ? fmtTime(values[f.name])
          : f.name === "days"
          ? `${values.days} ${values.days === "1" ? "day" : "days"}`
          : f.name === "duration"
          ? `${values[f.name]} ${(values.durationUnit || "").toLowerCase()}`
          : values[f.name],
    }));
}

/** Only the field values a form knows about (used to build and read search URLs). */
export function pickFormValues(formKey: FormKey, source: Record<string, string | string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const f of FORMS[formKey].fields) {
    const v = source[f.name];
    if (typeof v === "string" && v) out[f.name] = v;
  }
  return out;
}

/** Days a car is booked for: the chosen number for self drive, or pickup to return date (inclusive) with a driver. */
export function bookedDays(values: Record<string, string>) {
  if (values.mode === "With driver" && values.pickupDate && values.returnDate) {
    const diff = (Date.parse(values.returnDate) - Date.parse(values.pickupDate)) / 86_400_000;
    return Number.isFinite(diff) ? Math.max(1, Math.round(diff) + 1) : 1;
  }
  return Math.max(1, Number(values.days) || 1);
}
