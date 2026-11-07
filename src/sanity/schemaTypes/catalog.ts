import { defineField, defineType } from "sanity";
import { TypePhotoInput } from "../FallbackPhotoInput";
import { stockMedia, stockPhotoUrl } from "../stockPhoto";
import { GROUPS } from "@/data/vehicles";
import { ART_IDS } from "@/data/vehicleArt";
import { img, str, strList, txt } from "./helpers";
import { FORM_KEYS } from "@/data/services";

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
    img("image", "Photo for menus and cards (optional)"),
    img("heroImage", "Hero background photo (optional)", { description: "Wide photo behind the page title. Leave empty to show the illustrated scene." }),
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
    { ...img("image", "Photo", { description: "Side or 3/4 view on a plain light background. Used in 'Pick a style', 'Meet the fleet' and as the default for vehicles of this type." }), components: { input: TypePhotoInput } },
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
    img("image", "Photo"),
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
    str("name", "Name", { required: true }),
    img("photo", "Photo"),
    str("city", "City / area", { description: "Drivers in the customer's pickup city are shown first." }),
    defineField({ name: "experience", title: "Experience (years)", type: "number", validation: (r) => r.min(0).max(60) }),
    str("licence", "Licence", { description: "e.g. LMV, LMV + Transport, HMV" }),
    str("duty", "Duty type", { description: "e.g. Local & outstation, City & airport, Monthly / corporate" }),
    defineField({ name: "drives", title: "Drives", type: "array", of: [{ type: "string" }], options: { layout: "tags" }, description: "e.g. Car, SUV, Tempo traveller, Bus, Truck" }),
    defineField({ name: "languages", title: "Languages", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    txt("about", "About", { rows: 2 }),
    defineField({ name: "verified", title: "Documents verified", type: "boolean", initialValue: false }),
    defineField({ name: "available", title: "Show on website", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 100 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", city: "city", available: "available", media: "photo" },
    prepare: ({ title, city, available, media }) => ({ title, subtitle: [city, available === false && "hidden"].filter(Boolean).join(" · "), media }),
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
    img("photo", "Photo (optional)"),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "name", subtitle: "quote", media: "photo" } },
});
