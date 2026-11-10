import { defineField, defineType } from "sanity";
import { TypePhotoInput } from "../FallbackPhotoInput";
import { stockMedia, stockPhotoUrl } from "../stockPhoto";
import { GROUPS } from "@/data/vehicles";
import { ART_IDS } from "@/data/vehicleArt";
import { heroFitField, heroImg, heroPhoneImg, img, seo, str, strList, txt } from "./helpers";
import { FORM_KEYS } from "@/data/services";
import { DEFAULT_LOCATION, LOCATION_OPTIONS } from "@/data/cities";
import AreaInput from "../AreaInput";

const groupList = { list: GROUPS.map((g) => ({ title: g.name, value: g.id })) };

/** The four fixed vehicle groups. Text and image are editable; the set is fixed because forms and animations depend on it. */
export const vehicleGroup = defineType({
  name: "vehicleGroup",
  title: "Vehicle group",
  type: "document",
  fields: [
    defineField({ name: "key", title: "Group", type: "string", options: { ...groupList }, readOnly: true }),
    str("name", "Name", { required: true }),
    str("short", "Short name (menus and tabs)", { required: true }),
    txt("blurb", "Description", { rows: 2 }),
    // Not shown anywhere on the website; hidden (any photo already uploaded is kept).
    { ...img("image", "Photo for menus and cards (optional)"), hidden: true },
    heroImg("heroImage", "Hero background photo (optional)", { description: "Wide photo behind the page title. Remove it to go back to the standard illustrated scene." }),
    heroFitField("heroFit"),
    str("listTitle", "Heading", { description: "Above the vehicles on this page." }),
    heroPhoneImg("heroImageMobile"),
    // This service page's own Google title, description and share image (empty = good built-in defaults).
    // No tab: vehicle groups have no form tabs, and a field in an undefined tab stops the admin loading.
    seo(null),
  ],
  preview: { select: { title: "name", subtitle: "blurb", media: "image" } },
});

export const vehicleType = defineType({
  name: "vehicleType",
  title: "Vehicle type",
  type: "document",
  fields: [
    str("name", "Name", { required: true }),
    defineField({
      name: "key",
      title: "ID",
      type: "slug",
      description: "Used in links and filters. Click Generate.",
      options: { source: "name", maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "group", title: "Group", type: "string", options: { ...groupList, layout: "radio" }, validation: (r) => r.required() }),
    { ...img("image", "Photo", { description: "Side or 3/4 view on a plain light background. Used in 'Pick a style', 'Meet the fleet' and as the default for vehicles of this type. Best size: 1600 × 1000 px (16:10)." }), components: { input: TypePhotoInput } },
    defineField({
      name: "art",
      title: "Drawing style for animations",
      type: "string",
      options: { list: [...ART_IDS] },
      initialValue: "sedan",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 100 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", group: "group", key: "key.current", media: "image" },
    prepare: ({ title, group, key, media }) => ({ title, subtitle: GROUPS.find((g) => g.id === group)?.name, media: media ?? stockMedia(stockPhotoUrl(key, group)) }),
  },
});

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    str("name", "Name", { required: true }),
    defineField({ name: "key", title: "ID", type: "slug", options: { source: "name", maxLength: 40 }, validation: (r) => r.required() }),
    str("forWho", "Who it is for"),
    txt("offer", "What we offer", { rows: 2 }),
    strList("points", "Bullet points"),
    str("cta", "Button label"),
    defineField({
      name: "form",
      title: "Quote form",
      type: "string",
      options: { list: FORM_KEYS.map((k) => ({ title: k, value: k })) },
      initialValue: "cars",
      validation: (r) => r.required(),
    }),
    img("image", "Photo", { description: "Best size: 1600 × 1000 px (16:10). Keep the subject in the middle: Home crops it a little squarer." }),
    defineField({ name: "toConfirm", title: 'Show "details confirmed on WhatsApp" note', type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 100 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "forWho", media: "image" } },
});

export const driver = defineType({
  name: "driver",
  title: "Driver",
  type: "document",
  fields: [
    { ...str("name", "Name", { required: true }), placeholder: "e.g. Ramesh Kumar" },
    img("photo", "Photo", { description: "Face photo. Best size: 600 × 600 px (square)." }),
    // The older free-text place; kept (hidden) so nothing is lost. Location + Area below replace it.
    { ...str("city", "City / area (old)"), hidden: true },
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      options: { list: LOCATION_OPTIONS },
      initialValue: DEFAULT_LOCATION,
      description: "City where this driver is based. Customers who search from this city see them; other cities don't.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "area",
      title: "Area (optional)",
      type: "string",
      placeholder: "Type an area or pincode, or use your location",
      description: "Locality in that city. Pick a suggestion to fill Location and Pincode too. A search from this area lists this driver first.",
      components: { input: AreaInput },
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "pincode",
      title: "Pincode (optional)",
      type: "string",
      placeholder: "e.g. 533001",
      description: "A search with this pincode lists this driver first. Filled in when you pick an area.",
      validation: (r) => r.regex(/^[1-9]\d{5}$/, { name: "6-digit pincode" }),
    }),
    defineField({ name: "experience", title: "Experience (years)", type: "number", placeholder: "e.g. 8", validation: (r) => r.min(0).max(60) }),
    { ...str("licence", "Licence"), placeholder: "e.g. LMV + Transport" },
    { ...str("duty", "Duty type"), placeholder: "e.g. Local & outstation" },
    defineField({ name: "drives", title: "Drives", type: "array", of: [{ type: "string" }], options: { layout: "tags" }, description: "e.g. Car, SUV, Tempo traveller, Bus, Truck" }),
    defineField({ name: "languages", title: "Languages", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    { ...txt("about", "About", { rows: 2 }), placeholder: "e.g. Calm, punctual driver who knows Hyderabad and the routes to Srisailam and Tirupati." },
    defineField({ name: "verified", title: "Documents verified", type: "boolean", initialValue: false }),
    defineField({ name: "available", title: "Show on website", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Sort order", type: "number", description: "New ones start at 0, so they show first. Lower numbers show first.", initialValue: 0 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", city: "city", location: "location", area: "area", available: "available", media: "photo" },
    prepare: ({ title, city, location, area, available, media }) => ({
      title,
      subtitle: [[area, location].filter(Boolean).join(", ") || city, available === false && "hidden"].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Customer review",
  type: "document",
  fields: [
    txt("quote", "Review", { required: true }),
    str("name", "Customer name", { required: true }),
    str("detail", "Detail", { description: "e.g. Wedding trip, Hyderabad" }),
    defineField({ name: "rating", title: "Stars", type: "number", options: { list: [5, 4, 3] }, initialValue: 5 }),
    img("photo", "Photo (optional)", { description: "Shown as a small round picture. Best size: 400 × 400 px (square)." }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "name", subtitle: "quote", media: "photo" } },
});
