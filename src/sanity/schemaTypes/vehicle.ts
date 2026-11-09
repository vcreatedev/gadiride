import { defineArrayMember, defineField, defineType } from "sanity";
import { DEFAULT_LOCATION, LOCATION_OPTIONS } from "@/data/cities";
import AreaInput from "../AreaInput";
import TimerInput, { TimerField } from "../TimerInput";
import { GROUPS } from "@/data/vehicles";
import { VehiclePhotoInput } from "../FallbackPhotoInput";
import { stockMedia, stockPhotoUrl } from "../stockPhoto";

const photo = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: "image",
    group: "photos",
    description,
    options: { hotspot: true },
    fields: [defineField({ name: "alt", title: "Alt text (describe the photo)", type: "string" })],
  });

export const vehicle = defineType({
  name: "vehicle",
  title: "Vehicle",
  type: "document",
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "photos", title: "Photos" },
    { name: "details", title: "Details" },
    { name: "listing", title: "Listing" },
  ],
  fields: [
    defineField({ name: "name", title: "Name", type: "string", group: "main", placeholder: "e.g. Maruti Swift (Manual)", validation: (r) => r.required().max(60) }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "main",
      description: "Used in the page address, e.g. /vehicle/7-seater-suv/. Click Generate.",
      options: { source: "name", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "group",
      title: "Vehicle group",
      type: "string",
      group: "main",
      options: { list: GROUPS.map((g) => ({ title: g.name, value: g.id })), layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Vehicle type",
      type: "reference",
      group: "main",
      to: [{ type: "vehicleType" }],
      description: "Only types from the selected group are listed. Add new types under Catalog → Vehicle types.",
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
      group: "main",
      options: { list: LOCATION_OPTIONS },
      initialValue: DEFAULT_LOCATION,
      description: "City where this vehicle is based. Visitors who search from this city see it; other cities don't.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "area",
      title: "Area (optional)",
      type: "string",
      group: "main",
      placeholder: "Type an area or pincode, or use your location",
      description: "Locality in that city. Pick a suggestion to fill Location and Pincode too. A search from this area lists this vehicle first, then the rest of the city.",
      components: { input: AreaInput },
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "pincode",
      title: "Pincode (optional)",
      type: "string",
      group: "main",
      placeholder: "e.g. 533001",
      description: "A search with this pincode lists this vehicle first. Filled in when you pick an area.",
      validation: (r) => r.regex(/^[1-9]\d{5}$/, { name: "6-digit pincode" }),
    }),
    defineField({ name: "summary", title: "Short description", type: "text", rows: 3, group: "main", placeholder: "e.g. Easy to drive and park, great mileage for city trips. 5 seats, AC, music system.", validation: (r) => r.required().max(220) }),

    // Older vehicles kept their main photo here; it now lives first in Photos (see scripts/merge-vehicle-photos.ts).
    { ...photo("image", "Main photo (old)"), components: { input: VehiclePhotoInput }, hidden: true },
    defineField({
      name: "gallery",
      title: "Photos",
      type: "array",
      group: "photos",
      description: "The first photo is the main photo (cards and the top of the vehicle page); use Make main to move another one first. Then interior, boot, side, back. No photos = the vehicle type's photo. Best size: 1600 × 1000 px (16:10).",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
        }),
      ],
      validation: (r) => r.max(13),
    }),
    defineField({
      name: "photoFit",
      title: "Photo framing",
      type: "string",
      group: "photos",
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
      group: "photos",
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
    defineField({
      name: "photoZoom",
      title: "Zoom",
      type: "number",
      group: "photos",
      description: "100 = normal. Increase if the vehicle looks small in its card, e.g. 115.",
      initialValue: 100,
      validation: (r) => r.min(70).max(160),
    }),

    defineField({
      name: "specs",
      title: "Specifications",
      type: "array",
      group: "details",
      description: "Label and value pairs, e.g. Seats: 7, Fuel: CNG, Mileage: 34 km/kg. All show on the vehicle page; the first three also show on cards.",
      of: [
        defineArrayMember({
          type: "object",
          name: "spec",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", placeholder: "e.g. Seats", validation: (r) => r.required() }),
            defineField({ name: "value", title: "Value", type: "string", placeholder: "e.g. 5", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: "e.g. Self drive, With driver, With operator",
    }),
    defineField({
      name: "mileage",
      title: "Mileage",
      type: "string",
      group: "details",
      placeholder: "e.g. 20 km/l  ·  CNG: 31 km/kg  ·  JCB: 5 litres/hour",
      description: "Shown with the specifications on the vehicle page. Empty = not shown.",
    }),
    defineField({
      name: "pricePerDay",
      title: "Price per day (₹)",
      type: "number",
      placeholder: "e.g. 1499",
      group: "details",
      description: 'Only shown when "Show prices" is on in Site settings.',
      validation: (r) => r.min(0),
    }),
    defineField({ name: "available", title: "Show on website", type: "boolean", group: "listing", initialValue: true }),
    defineField({
      name: "liveFrom",
      title: "Go live at (optional)",
      type: "datetime",
      group: ["main", "listing"], // on Main too, so it is filled in while adding a vehicle
      description: "Publish now and the vehicle stays off the website until this date and time, then appears by itself. Empty = live as soon as it is published.",
      components: { input: TimerInput, field: TimerField },
    }),
    defineField({
      name: "liveUntil",
      title: "Show until (optional)",
      type: "datetime",
      group: ["main", "listing"], // on Main too, so it is filled in while adding a vehicle
      description: "The vehicle hides itself from the website after this date and time. Use the buttons to show it for a number of days. Empty = no end.",
      components: { input: TimerInput, field: TimerField },
      validation: (r) =>
        r.custom((until, ctx) => {
          const from = (ctx.document as { liveFrom?: string } | undefined)?.liveFrom;
          return !until || !from || Date.parse(String(until)) > Date.parse(from) ? true : "Must be after Go live at";
        }),
    }),
    defineField({ name: "featured", title: 'Show in "Popular right now" on the home page', type: "boolean", group: "listing", initialValue: false }),
    defineField({ name: "order", title: "Sort order", type: "number", group: "listing", description: "New ones start at 0, so they show first. Lower numbers show first.", initialValue: 0 }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }, { field: "name", direction: "asc" }] },
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", location: "location", area: "area", group: "group", type: "type.name", typeKey: "type.key.current", media: "image", firstPhoto: "gallery.0", typeMedia: "type.image", available: "available", featured: "featured" },
    prepare: ({ title, location, area, group, type, typeKey, media, firstPhoto, typeMedia, available, featured }) => ({
      title,
      subtitle: [GROUPS.find((g) => g.id === group)?.short, type, [area, location || DEFAULT_LOCATION].filter(Boolean).join(", "), featured && "★ featured", available === false && "hidden"].filter(Boolean).join(" · "),
      // Same photo the website shows: own photo, else the type's, else the built-in one.
      media: media ?? firstPhoto ?? typeMedia ?? stockMedia(stockPhotoUrl(typeKey, group)),
    }),
  },
});
