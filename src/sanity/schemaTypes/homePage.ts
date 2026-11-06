import { defineArrayMember, defineField, defineType } from "sanity";
import { GROUPS } from "@/data/vehicles";
import { HEADING_HINT, section, seo, str, strList, titleTextList, txt } from "./helpers";

const G = [
  { name: "hero", title: "Hero" },
  { name: "styles", title: "Styles" },
  { name: "featured", title: "Popular" },
  { name: "story", title: "Story" },
  { name: "fleet", title: "Fleet" },
  { name: "services", title: "Services" },
  { name: "promos", title: "Promos" },
  { name: "why", title: "Why us" },
  { name: "how", title: "How it works" },
  { name: "corporate", title: "Corporate" },
  { name: "careers", title: "Careers" },
  { name: "partner", title: "Attach vehicle" },
  { name: "more", title: "Reviews, cities, FAQ" },
  { name: "final", title: "Final CTA" },
  { name: "seo", title: "SEO" },
];

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: G,
  fields: [
    section("hero", "Hero", [
      str("title", "Headline"),
      str("highlight", "Highlighted words (orange gradient)", { description: "Shown after the headline." }),
      txt("subtitle", "Subtitle", { rows: 2 }),
      str("primaryCta", "Main button"),
      str("secondaryCta", "Second button"),
    ]),
    defineField({
      name: "slides",
      title: "Hero slides (one per service)",
      type: "array",
      group: "hero",
      description: "Promotional slides at the top of the home page. They rotate every 7 seconds.",
      of: [
        defineArrayMember({
          type: "object",
          name: "slide",
          fields: [
            defineField({ name: "group", title: "Service", type: "string", options: { list: [...GROUPS.map((g) => ({ title: g.name, value: g.id })), { title: "Drivers", value: "driver" }, { title: "Attach your vehicle", value: "partner" }] } }),
            str("eyebrow", "Small label"),
            str("title", "Headline"),
            str("highlight", "Highlighted line (orange)"),
            txt("text", "Text", { rows: 2 }),
            strList("points", "Key points (3 work best)"),
            str("cta", "Button label"),
            str("href", "Button link", { description: "e.g. /vehicles/cars/" }),
            defineField({ name: "scene", title: "Background", type: "string", options: { list: ["city", "highway", "port", "site", "street"] } }),
            defineField({ name: "art", title: "Vehicle drawing", type: "string", options: { list: ["hatch", "sedan", "suv", "van", "bus", "pickup", "truck", "jcb"] } }),
            str("color", "Vehicle colour", { description: "Hex, e.g. #FFC20E" }),
          ],
          preview: { select: { title: "title", subtitle: "highlight" } },
        }),
      ],
    }),
    section("hub", "Services overview", [
      str("title", "Heading", { description: HEADING_HINT }),
      txt("text", "Text", { rows: 2 }),
      defineField({
        name: "items",
        title: "Services",
        type: "array",
        of: [
          defineArrayMember({
            type: "object",
            name: "item",
            fields: [
              str("title", "Title"),
              txt("text", "Text", { rows: 2 }),
              str("tag", "Tag", { description: "e.g. From ₹1,199/day" }),
              str("href", "Link"),
              defineField({ name: "art", title: "Vehicle drawing", type: "string", options: { list: ["hatch", "sedan", "suv", "van", "bus", "pickup", "truck", "jcb"] } }),
              str("color", "Vehicle colour"),
            ],
            preview: { select: { title: "title", subtitle: "tag" } },
          }),
        ],
      }),
    ], "services"),
    section("styles", "Pick a style", [str("title", "Heading", { description: HEADING_HINT })]),
    section("featured", "Popular right now", [
      str("title", "Heading", { description: HEADING_HINT }),
      txt("text", "Text", { rows: 2 }),
      str("linkLabel", "Link label"),
    ]),
    section("story", "Scrolling story", [
      str("title", "Heading (mobile)", { description: HEADING_HINT }),
      str("cta", "Button in the last chapter"),
      defineField({
        name: "chapters",
        title: "Chapters",
        type: "array",
        description: "Keep 6 chapters. Chapters 2 to 5 show cars, passenger, logistics and equipment drawings in that order.",
        validation: (r) => r.max(6),
        of: [
          defineArrayMember({
            type: "object",
            name: "chapter",
            fields: [str("key", "Short label"), str("title", "Title"), txt("text", "Text", { rows: 2 }), str("readout", "Speedometer label")],
            preview: { select: { title: "title", subtitle: "key" } },
          }),
        ],
      }),
    ]),
    section("fleet", "Meet the fleet", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), str("cta", "Button")]),
    section("services", "Services", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), str("linkLabel", "Card link label")]),
    defineField({
      name: "promos",
      title: "Promo cards",
      type: "array",
      group: "promos",
      of: [
        defineArrayMember({
          type: "object",
          name: "promo",
          fields: [
            str("title", "Title"),
            txt("text", "Text", { rows: 2 }),
            str("cta", "Button"),
            defineField({
              name: "group",
              title: "Opens the booking form for",
              type: "string",
              options: { list: GROUPS.map((g) => ({ title: g.name, value: g.id })) },
            }),
            defineField({
              name: "tone",
              title: "Card colour",
              type: "string",
              options: { list: ["brand", "dark", "taxi", "light"], layout: "radio", direction: "horizontal" },
              initialValue: "light",
            }),
          ],
          preview: { select: { title: "title", subtitle: "cta" } },
        }),
      ],
    }),
    section("why", "Why rent with us", [str("titleTop", "Heading line 1 (orange)"), str("titleBottom", "Heading line 2"), titleTextList("items", "Reasons (4)")]),
    section("how", "How booking works", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), titleTextList("steps", "Steps")]),
    section("corporate", "Corporate", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text"), strList("points", "Bullet points")]),
    section("careers", "Careers teaser", [str("title", "Heading"), txt("text", "Text", { rows: 2 }), str("cta", "Button")]),
    section("partner", "Attach your vehicle", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), str("cta", "Button")]),
    section("testimonials", "Reviews section", [str("title", "Heading", { description: "Only shown once reviews are added." })], "more"),
    section("cities", "Cities section", [str("title", "Heading", { description: "Only shown once cities are added in Site settings." })], "more"),
    section("faq", "FAQ section", [str("title", "Heading")], "more"),
    section("final", "Final call to action", [
      str("title", "Heading", { description: HEADING_HINT }),
      txt("text", "Text", { rows: 2 }),
      str("primaryCta", "Main button"),
      str("whatsappCta", "WhatsApp button"),
    ]),
    seo(),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
