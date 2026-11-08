import { defineArrayMember, defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";
import { TRIP_RULES } from "@/lib/trips";

/** Today's date in India (YYYY-MM-DD), the default for a new trip. */
const todayInIndia = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

/**
 * "Today trip": a car going from one city to another on a date, with seats to share
 * (like BlaBlaCar). Visitors pick "Today trip" in the Cars search bar and search by pickup and drop.
 * Past trips hide on their own.
 */
export const trip = defineType({
  name: "trip",
  title: "Today trip",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "vehicle",
      title: "Car",
      type: "reference",
      to: [{ type: "vehicle" }],
      options: { filter: 'group == "cars"', disableNew: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "from", title: "From", type: "string", placeholder: "e.g. Hyderabad (Ameerpet)", validation: (r) => r.required() }),
    defineField({ name: "to", title: "To", type: "string", placeholder: "e.g. Kakinada", validation: (r) => r.required() }),
    defineField({
      name: "via",
      title: "Stops on the way (optional)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: "e.g. Suryapet, Vijayawada, Rajahmundry. People going to or from these places also find this trip.",
    }),
    defineField({ name: "date", title: "Date", type: "date", initialValue: todayInIndia, validation: (r) => r.required() }),
    defineField({
      name: "time",
      title: "Start time",
      type: "string",
      placeholder: "e.g. 06:30",
      validation: (r) => r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "time (HH:MM)" }),
    }),
    defineField({
      name: "expiresAt",
      title: "Remove from website at (date & time)",
      type: "datetime",
      options: { dateFormat: "DD MMM YYYY", timeFormat: "hh:mm A", timeStep: 15 },
      description: "The trip disappears from the website at this date and time. Empty = when the trip starts (its date and start time).",
    }),
    defineField({ name: "seats", title: "Seats left", type: "number", placeholder: "e.g. 3", initialValue: 3, validation: (r) => r.required().min(0).max(60) }),
    defineField({
      name: "full",
      title: "Fully booked",
      type: "boolean",
      initialValue: false,
      description: "Switch on when no seats are left. The trip still shows, marked “Fully booked”, and can’t be requested.",
    }),
    defineField({ name: "pricePerSeat", title: "Price per seat (₹)", type: "number", placeholder: "e.g. 900", validation: (r) => r.min(0) }),
    defineField({
      name: "rules",
      title: "Trip rules",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: TRIP_RULES.map((r) => ({ title: r, value: r })), layout: "grid" },
      description: "Tick what applies. Shown on the trip card and its details page.",
    }),
    defineField({ name: "notes", title: "Notes (optional)", type: "text", rows: 2, placeholder: "e.g. AC, one small bag per person, pickup near Ameerpet metro." }),
    defineField({ name: "available", title: "Show on website", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Date", name: "dateAsc", by: [{ field: "date", direction: "asc" }, { field: "time", direction: "asc" }] }],
  preview: {
    select: { from: "from", to: "to", date: "date", time: "time", seats: "seats", full: "full", car: "vehicle.name", media: "vehicle.image" },
    prepare: ({ from, to, date, time, seats, full, car, media }) => ({
      title: `${from || "?"} → ${to || "?"}`,
      subtitle: [date, time, car, full || seats === 0 ? "FULLY BOOKED" : typeof seats === "number" ? `${seats} seats left` : ""].filter(Boolean).join(" · "),
      media,
    }),
  },
});
