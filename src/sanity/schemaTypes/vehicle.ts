import { defineArrayMember, defineField, defineType } from "sanity";
import { DEFAULT_LOCATION, LOCATION_OPTIONS } from "@/data/cities";
import AreaInput from "../AreaInput";
import TimerInput, { TimerField } from "../TimerInput";
import { SiteContactInput } from "../SiteDefaultInputs";
import { GROUPS } from "@/data/vehicles";
import { VehiclePhotoInput } from "../FallbackPhotoInput";
import { stockMedia, stockPhotoUrl } from "../stockPhoto";
import VehicleNameInput from "../VehicleNameInput";
import VehicleTypeInput from "../VehicleTypeInput";
import SpecsInput from "../SpecsInput";
import OptionsInput from "../OptionsInput";
import { defaultSpecs, defaultSummary } from "../vehicleForm";

/** A 10-digit mobile, or with the country code; spaces, + and - are fine. */
const contactNumber = (v?: string) =>
  !v || /^\d{10,13}$/.test(v.replace(/[\s()+-]/g, "")) || "Enter a 10-digit mobile number, e.g. 98765 43210 (or with the country code: 91 98765 43210).";

const SUMMARY_MAX = 220;

/** All fields in one list, no tabs: what the vehicle is, its photos, details, price and contact, then when it shows. */
export const vehicle = defineType({
  name: "vehicle",
  title: "Vehicle",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      placeholder: "e.g. Maruti Swift (Manual)",
      description: "Also makes the page address (e.g. /vehicle/maruti-swift-manual/). It stays the same once the vehicle is live.",
      components: { input: VehicleNameInput },
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: "group",
      title: "Vehicle group",
      type: "string",
      options: { list: GROUPS.map((g) => ({ title: g.name, value: g.id })), layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Vehicle type",
      type: "reference",
      to: [{ type: "vehicleType" }],
      description: "Only types from the selected group are listed. Not there? Click New vehicle type.",
      components: { input: VehicleTypeInput },
      options: {
        disableNew: true,
        filter: ({ document }) => ({
          filter: "group == $group",
          params: { group: (document as { group?: string }).group ?? "" },
        }),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      options: { list: LOCATION_OPTIONS },
      initialValue: DEFAULT_LOCATION,
      description: "City where this vehicle is based. Visitors who search from this city see it; other cities don't.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "area",
      title: "Area (optional)",
      type: "string",
      placeholder: "Type an area or pincode, or use your location",
      description: "Locality in that city. Pick a suggestion to fill Location and Pincode too. A search from this area lists this vehicle first, then the rest of the city.",
      components: { input: AreaInput },
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "pincode",
      title: "Pincode (optional)",
      type: "string",
      placeholder: "e.g. 533001",
      description: "A search with this pincode lists this vehicle first. Filled in when you pick an area.",
      validation: (r) => r.regex(/^[1-9]\d{5}$/, { name: "6-digit pincode" }),
    }),
    defineField({
      name: "summary",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "Starts with a sample: change it to describe this vehicle.",
      // New vehicles added from a group get that group's sample (see the vehicle-by-group template).
      initialValue: defaultSummary("cars"),
      validation: (r) => r.required().max(SUMMARY_MAX),
    }),

    defineField({
      name: "gallery",
      title: "Photos",
      type: "array",
      description: "Upload several at once. The first photo is the main photo (cards and the top of the vehicle page); use Make main to move another one first. No photos = the vehicle type's photo. Best size: 1600 × 1000 px (16:10).",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
        }),
      ],
      // "Upload photos" (several at once) and photo links replace the one-at-a-time "Add item".
      options: { disableActions: ["add", "addBefore", "addAfter"] },
      validation: (r) => r.max(13),
    }),
    defineField({
      name: "photoFit",
      title: "Photo framing",
      type: "string",
      initialValue: "cover",
      options: {
        layout: "radio",
        list: [
          { title: "Fill the frame (best for normal photos; set the hotspot on the vehicle)", value: "cover" },
          { title: "Show the whole vehicle (best for cut-out PNGs on a transparent or white background)", value: "contain" },
        ],
      },
    }),
    defineField({
      name: "photoBackground",
      title: "Card background behind the photo",
      type: "string",
      initialValue: "studio",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Studio (warm grey)", value: "studio" },
          { title: "White", value: "white" },
          { title: "Dark", value: "dark" },
          { title: "Brand orange", value: "brand" },
        ],
      },
    }),
    // Not in the form any more; a zoom already set on a vehicle still applies on the website (100 = normal).
    defineField({ name: "photoZoom", title: "Zoom", type: "number", initialValue: 100, hidden: true, validation: (r) => r.min(70).max(160) }),

    defineField({
      name: "specs",
      title: "Specifications",
      type: "array",
      description: "Fill in the values; pick from the list (▾) or type your own. Empty rows are not shown. All show on the vehicle page; the first three also show on the cards. Drag to change the order.",
      components: { input: SpecsInput },
      // New vehicles start with Seats, Transmission, Fuel and Mileage (group-specific from the vehicle-by-group template).
      initialValue: () => defaultSpecs("cars"),
      of: [
        defineArrayMember({
          type: "object",
          name: "spec",
          fields: [
            // Empty rows are skipped on the website, so these are not required (no red boxes while typing).
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: 'Shown as ticks on the vehicle page. Type one and press Enter, or use Quick add. Without "Self drive", the booking form starts on "With driver".',
      components: { input: OptionsInput },
    }),
    defineField({
      name: "pricePerDay",
      title: "Price per day (₹)",
      type: "number",
      placeholder: "e.g. 1499",
      description: 'Shown on the vehicle cards and the vehicle page. Empty = "Price on request".',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number (optional)",
      type: "string",
      description: "WhatsApp bookings for this vehicle go to this number. Empty = the WhatsApp number in Site settings.",
      components: { input: SiteContactInput },
      validation: (r) => r.custom(contactNumber),
    }),
    defineField({
      name: "phone",
      title: "Phone number (optional)",
      type: "string",
      description: "The Call button on this vehicle rings this number. Empty = the phone in Site settings.",
      components: { input: SiteContactInput },
      validation: (r) => r.custom(contactNumber),
    }),
    defineField({ name: "available", title: "Show on website", type: "boolean", initialValue: true }),
    defineField({
      name: "liveFrom",
      title: "Go live at (optional)",
      type: "datetime",
      description: "Publish now and the vehicle stays off the website until this date and time, then appears by itself. Empty = live as soon as it is published.",
      components: { input: TimerInput, field: TimerField },
    }),
    defineField({
      name: "liveUntil",
      title: "Show until (optional)",
      type: "datetime",
      description: "The vehicle hides itself from the website after this date and time. Use the buttons to show it for a number of days. Empty = no end.",
      components: { input: TimerInput, field: TimerField },
      validation: (r) =>
        r.custom((until, ctx) => {
          const from = (ctx.document as { liveFrom?: string } | undefined)?.liveFrom;
          return !until || !from || Date.parse(String(until)) > Date.parse(from) ? true : "Must be after Go live at";
        }),
    }),
    defineField({ name: "featured", title: 'Show in "Popular right now" on the home page', type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Sort order", type: "number", description: "New ones start at 0, so they show first. Lower numbers show first.", initialValue: 0 }),

    // Not in the form. The page address is made from the Name (VehicleNameInput).
    defineField({ name: "slug", title: "Page address", type: "slug", options: { source: "name", maxLength: 80 }, hidden: true }),
    // Older vehicles kept their main photo here; it now lives first in Photos (see scripts/merge-vehicle-photos.ts).
    defineField({
      name: "image",
      title: "Main photo (old)",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text (describe the photo)", type: "string" })],
      components: { input: VehiclePhotoInput },
      hidden: true,
    }),
    // The old Mileage box: Mileage is now a row in Specifications. Kept so older values still show on
    // the website until moved (Specifications offers "Move into the list").
    defineField({ name: "mileage", title: "Mileage (old)", type: "string", hidden: true }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }, { field: "name", direction: "asc" }] },
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "name",
      location: "location",
      area: "area",
      group: "group",
      type: "type.name",
      typeKey: "type.key.current",
      media: "image",
      firstPhoto: "gallery.0",
      typeMedia: "type.image",
      available: "available",
      featured: "featured",
      pricePerDay: "pricePerDay",
    },
    prepare: ({ title, location, area, group, type, typeKey, media, firstPhoto, typeMedia, available, featured, pricePerDay }) => ({
      title: title || "Untitled vehicle",
      subtitle: [
        typeof pricePerDay === "number" ? `₹${pricePerDay.toLocaleString("en-IN")}/day` : "Price on request",
        type || GROUPS.find((g) => g.id === group)?.short,
        [area, location || DEFAULT_LOCATION].filter(Boolean).join(", "),
        featured && "★ featured",
        available === false && "hidden",
      ]
        .filter(Boolean)
        .join(" · "),
      // Same photo the website shows: own photo, else the type's, else the built-in one.
      media: media ?? firstPhoto ?? typeMedia ?? stockMedia(stockPhotoUrl(typeKey, group)),
    }),
  },
});
