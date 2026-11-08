import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";
import { GROUPS } from "@/data/vehicles";
import { HEADING_HINT, formSettings, offerBanners, section, sectionOrder, seo, str, strList, titleTextList, txt } from "./helpers";
import { HOME_SECTIONS } from "@/data/sections";
import TabField from "../TabField";

/** Search bar tabs, in the bar's order. */
const SEARCH_TABS = [...GROUPS.map((g) => ({ id: g.id, title: `${g.name} tab` })), { id: "driver" as const, title: "Drivers tab" }];

/**
 * Tabs follow the home page from top to bottom, so editors can work down the page.
 * Strip and areas live in Site settings (shared with other pages).
 */
const G = [
  { name: "layout", title: "0 · Section order" },
  { name: "hero", title: "1 · Hero slides", default: true },
  { name: "services", title: "2 · Everything on wheels" },
  { name: "featured", title: "3 · Offers & popular" },
  { name: "why", title: "4 · Why rent with us" },
  { name: "how", title: "5 · How booking works" },
  { name: "more", title: "6 · Reviews" },
  { name: "partner", title: "7 · Attach your vehicle" },
  { name: "corporate", title: "8 · Corporate" },
  { name: "faq", title: "9 · FAQ" },
  { name: "final", title: "10 · Final call to action" },
  { name: "seo", title: "SEO" },
];

/** Older fields the current home page no longer shows: kept (data is safe) but hidden. */
const RETIRED = new Set(["hero", "styles", "story", "fleet", "services", "promos", "careers", "cities"]);
/** Field order = the order sections appear on the page. */
const ORDER = ["layout", "slides", "heroTheme", "searchBar", "hub", "offers", "featured", "trips", "why", "how", "testimonials", "partner", "corporate", "faq", "final", "seo"];

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: G,
  fields: arrange([
    sectionOrder(HOME_SECTIONS, "layout"),
    defineField({
      name: "heroTheme",
      title: "Hero style",
      type: "string",
      group: "hero",
      description: "Light: daytime scenes on a cream background. Dark: night scenes with lit windows. Applies to every page header and the search bar.",
      options: { list: [{ title: "Light (day)", value: "light" }, { title: "Dark (night)", value: "dark" }], layout: "radio" },
      initialValue: "light",
    }),
    defineField({
      name: "searchBar",
      title: "Search bar",
      type: "object",
      group: "hero",
      description: "Under the hero, and on each service page and the search results. Each tab's form is also the quote form on that service's pages.",
      fields: [
        str("badge", "Text on the right", { description: "e.g. Confirmed on WhatsApp" }),
        ...SEARCH_TABS.map((t) =>
          defineField({
            name: t.id,
            title: t.title,
            type: "object",
            options: { collapsible: true, collapsed: true },
            fields: [
              str("label", "Tab name", { description: "Empty = the name in the Header menu." }),
              str("search", "Search button"),
              formSettings(t.id),
            ],
          }),
        ),
      ],
    }),
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
    section("trips", "Today trips", [
      str("title", "Heading", { description: HEADING_HINT }),
      txt("text", "Text", { rows: 2 }),
      str("linkLabel", "Button under the trips", { description: "Opens all trips on the Cars page." }),
    ], "featured"),
    section("styles", "Pick a style", [str("title", "Heading", { description: HEADING_HINT })]),
    section("featured", "Popular right now", [
      str("title", "Heading", { description: HEADING_HINT }),
      txt("text", "Text", { rows: 2 }),
      str("linkLabel", "“View all” button", { description: "Under the tabs. Opens the full list for the open tab." }),
      defineField({
        name: "tabs",
        title: "Tab labels",
        type: "object",
        fields: [str("cars", "Cars"), str("passenger", "Passenger"), str("logistics", "Logistics"), str("equipment", "Equipment"), str("drivers", "Drivers")].map((f) => ({ ...f, components: { field: TabField } })),
      }),
    ]),
    section("offers", "Offers & deals", [str("title", "Heading on Home"), str("vehiclesTitle", "Heading on vehicle pages"), offerBanners()], "featured"),
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
    section("corporate", "Corporate", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text"), strList("points", "Bullet points"), formSettings("corporate")]),
    section("careers", "Careers teaser", [str("title", "Heading"), txt("text", "Text", { rows: 2 }), str("cta", "Button")]),
    section("partner", "Attach your vehicle", [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), str("cta", "Button")]),
    section("testimonials", "Reviews section", [str("title", "Heading", { description: "Only shown once reviews are added (Home → Customer reviews)." })], "more"),
    section("cities", "Cities section", [str("title", "Heading", { description: "Only shown once cities are added in Site settings." })], "more"),
    section("faq", "FAQ section", [str("title", "Heading", { description: "The questions themselves are under FAQ → Questions." })], "faq"),
    section("final", "Final call to action", [
      str("title", "Heading", { description: HEADING_HINT }),
      txt("text", "Text", { rows: 2 }),
      str("primaryCta", "Main button"),
      str("whatsappCta", "WhatsApp button"),
    ]),
    seo(),
  ]),
  preview: { prepare: () => ({ title: "Home page", subtitle: "Sections from top to bottom" }) },
});

function arrange(fields: FieldDefinition[]): FieldDefinition[] {
  const rank = (f: FieldDefinition) => (ORDER.includes(f.name) ? ORDER.indexOf(f.name) : ORDER.length);
  return [...fields].sort((a, b) => rank(a) - rank(b)).map((f) => (RETIRED.has(f.name) ? { ...f, hidden: true, group: undefined } : f));
}
