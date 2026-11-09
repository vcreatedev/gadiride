import { defineArrayMember, defineField, defineType } from "sanity";
import { img, linkList, offerBanners, sectionOrder, str, strList, titleTextList, txt } from "./helpers";
import { NAV_ITEMS } from "@/data/sections";

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
            defineField({ name: "label", title: "Label", type: "string", description: "e.g. Instagram, Facebook, YouTube, LinkedIn, X (the icon is picked from the link)", validation: (r) => r.required() }),
            defineField({ name: "href", title: "URL", type: "url", placeholder: "https://www.instagram.com/gadirideofficial/", validation: (r) => r.required() }),
          ],
        }),
      ],
    }),

    str("tagline", "Tagline", { group: "brand" }),
    img("logo", "Full logo", { group: "brand", description: "Shown in the footer. Wide image on white works best. Best size: about 600 × 160 px (PNG or SVG)." }),
    txt("footerBlurb", "Footer text", { group: "brand", rows: 2 }),
    img("shareImage", "Default share image (1200 × 630)", { group: "brand", description: "Used when a page has no share image of its own. Size: 1200 × 630 px." }),

    img("headerLogo", "Header logo (optional)", { group: "nav", description: "Leave empty to use the Gadiride name from the brand logo. A wide logo on a transparent background works best. Best size: about 600 × 160 px (PNG, WebP or SVG); it shows 40 px tall." }),
    sectionOrder(NAV_ITEMS, "nav", {
      name: "navOrder",
      title: "Header: menu order",
      description: "Drag to reorder the header menu (desktop and mobile). Switch off \"Show\" to hide a link. \"More\" always stays last.",
    }),
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
    str("footerContactLink", "Footer: contact page link", { group: "nav", description: "e.g. Contact page. Empty = no link." }),
    str("copyright", "Footer: copyright line", { group: "nav", description: "{year} becomes the current year." }),
    defineField({ name: "showSocial", title: "Footer: show the social icons", type: "boolean", group: "nav", initialValue: true }),
    str("socialTitle", "Footer: heading above the social icons", { group: "nav", description: "e.g. Follow us" }),
    defineField({ name: "showCredit", title: "Footer: show the website credit", type: "boolean", group: "nav", initialValue: true }),
    str("creditLabel", "Footer: credit text", { group: "nav", description: "e.g. Website developed by" }),
    str("creditName", "Footer: credit name", { group: "nav", description: "e.g. Vcreate. Empty = no credit line." }),
    defineField({ name: "creditUrl", title: "Footer: credit link", type: "url", group: "nav", description: "e.g. https://www.vcreateofficial.com/" }),

    strList("marquee", "Scrolling strip", { group: "offers", description: "Short lines that scroll under the service-page hero. The phone number is added automatically." }),
    offerBanners("banners", { hidden: true, description: "Moved to Home → Offers & deals. Kept so older data is not lost." }),
    str("areasTitle", "Areas section title", { group: "areas" }),
    txt("areasText", "Areas section text", { group: "areas", rows: 2 }),
    strList("areas", "Areas we serve", { group: "areas", description: "Shown on the Cars page and suggested in location fields." }),
    titleTextList("highlights", "Highlights", { group: "areas", description: "Four short reasons to rent, shown with the areas." }),

    defineField({
      name: "heroTheme",
      title: "Hero style",
      type: "string",
      group: "display",
      hidden: true,
      description: "Moved to Home → Hero. Light: daytime scenes on a cream background. Dark: night scenes with lit windows. Applies to every page header and the search bar.",
      options: { list: [{ title: "Light (day)", value: "light" }, { title: "Dark (night)", value: "dark" }], layout: "radio" },
      initialValue: "light",
    }),
    defineField({ name: "showPrices", title: "Show prices on the website", type: "boolean", group: "display", initialValue: false }),
    defineField({
      name: "showIntro",
      title: "Play the logo intro",
      type: "boolean",
      group: "display",
      description: "The Gadiride logo animation before the site shows. Turn off for the fastest first load.",
      initialValue: true,
    }),
    defineField({
      name: "introRepeat",
      title: "How often the intro plays",
      type: "string",
      group: "display",
      options: {
        list: [
          { title: "Once a day per visitor (fastest, recommended)", value: "daily" },
          { title: "Once per visit (until the browser is closed)", value: "session" },
          { title: "Every page load (slowest)", value: "every" },
        ],
        layout: "radio",
      },
      description: "Returning visitors skip the intro and see the site straight away, which also helps Google's speed score.",
      initialValue: "daily",
      hidden: ({ document }) => (document as { showIntro?: boolean } | undefined)?.showIntro === false,
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
