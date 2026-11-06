import { defineArrayMember, defineField, defineType } from "sanity";
import { img, linkList, str, strList, titleTextList, txt } from "./helpers";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "brand", title: "Brand" },
    { name: "nav", title: "Header & footer" },
    { name: "offers", title: "Offers & banners" },
    { name: "areas", title: "Hyderabad areas" },
    { name: "display", title: "Display" },
  ],
  fields: [
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      group: "contact",
      description: "Country code + number, digits only. e.g. 919876543210",
      validation: (r) => r.regex(/^\d{10,15}$/, { name: "digits only" }),
    }),
    str("phone", "Phone (as displayed)", { group: "contact", description: "e.g. +91 98765 43210. Leave empty to hide the Call buttons." }),
    defineField({ name: "email", title: "Email", type: "string", group: "contact", validation: (r) => r.email() }),
    txt("address", "Address", { group: "contact" }),
    defineField({
      name: "cities",
      title: "Cities we serve",
      type: "array",
      group: "contact",
      description: "Leave empty to hide the cities section.",
      of: [
        defineArrayMember({
          type: "object",
          name: "city",
          fields: [
            defineField({ name: "name", title: "City", type: "string", validation: (r) => r.required() }),
            defineField({ name: "note", title: "Note", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "social",
      title: "Social links",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "href", title: "URL", type: "url", validation: (r) => r.required() }),
          ],
        }),
      ],
    }),

    str("tagline", "Tagline", { group: "brand" }),
    img("logo", "Full logo", { group: "brand", description: "Shown in the footer. Wide image on white works best." }),
    txt("footerBlurb", "Footer text", { group: "brand", rows: 2 }),
    img("shareImage", "Default share image (1200 × 630)", { group: "brand", description: "Used when a page has no share image of its own." }),

    img("headerLogo", "Header logo (optional)", { group: "nav", description: "Leave empty to use the built-in Gadiride wordmark. A wide logo on a transparent background works best." }),
    str("driversLabel", "Header: Drivers link label", { group: "nav" }),
    linkList("navMore", "Header: \"More\" menu links", { group: "nav", description: "Also listed in the mobile menu, in this order. Vehicle groups come first automatically." }),
    defineField({
      name: "footerColumns",
      title: "Footer link columns",
      type: "array",
      group: "nav",
      description: "Drag to reorder columns. The Contact column is built from the contact details.",
      of: [
        defineArrayMember({
          type: "object",
          name: "column",
          fields: [str("title", "Column heading", { required: true }), linkList("links", "Links")],
          preview: { select: { title: "title" } },
        }),
      ],
    }),
    str("footerContactTitle", "Footer: contact column heading", { group: "nav" }),
    str("copyright", "Footer: copyright line", { group: "nav", description: "{year} becomes the current year." }),

    strList("marquee", "Scrolling strip", { group: "offers", description: "Short lines that scroll under the service-page hero. The phone number is added automatically." }),
    defineField({
      name: "banners",
      title: "Offer banners",
      type: "array",
      group: "offers",
      description: "Shown as a slider on the service page chosen in each banner.",
      of: [
        defineArrayMember({
          type: "object",
          name: "banner",
          fields: [
            str("eyebrow", "Small label", { description: "e.g. Self drive, Airport" }),
            str("title", "Title", { required: true }),
            txt("text", "Text", { rows: 2 }),
            str("cta", "Button label"),
            str("href", "Button link", { description: 'A page like /vehicles/cars/#all, or "tel" to call, or "whatsapp" to chat.' }),
            defineField({ name: "tone", title: "Colour", type: "string", options: { list: [{ title: "Orange", value: "brand" }, { title: "Dark", value: "dark" }, { title: "Yellow", value: "taxi" }], layout: "radio" }, initialValue: "brand" }),
            defineField({ name: "art", title: "Vehicle drawing", type: "string", options: { list: ["hatch", "sedan", "suv", "van", "bus", "pickup", "truck", "jcb"] }, initialValue: "sedan" }),
            str("color", "Vehicle colour", { description: "Hex, e.g. #FFC20E" }),
            defineField({ name: "group", title: "Show on", type: "string", options: { list: ["cars", "passenger", "logistics", "equipment", "driver"] }, initialValue: "cars" }),
          ],
          preview: { select: { title: "title", subtitle: "group" } },
        }),
      ],
    }),
    str("areasTitle", "Areas section title", { group: "areas" }),
    txt("areasText", "Areas section text", { group: "areas", rows: 2 }),
    strList("areas", "Areas we serve", { group: "areas", description: "Shown on the Cars page and suggested in location fields." }),
    titleTextList("highlights", "Highlights", { group: "areas", description: "Four short reasons to rent, shown with the areas." }),

    defineField({
      name: "heroTheme",
      title: "Hero style",
      type: "string",
      group: "display",
      description: "Light: daytime scenes on a cream background. Dark: night scenes with lit windows. Applies to every page header and the search bar.",
      options: { list: [{ title: "Light (day)", value: "light" }, { title: "Dark (night)", value: "dark" }], layout: "radio" },
      initialValue: "light",
    }),
    defineField({ name: "showPrices", title: "Show prices on the website", type: "boolean", group: "display", initialValue: false }),
    defineField({
      name: "showIntro",
      title: "Play the logo intro",
      type: "boolean",
      group: "display",
      description: "Plays on every full page load. Turn off for the fastest first load.",
      initialValue: true,
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
