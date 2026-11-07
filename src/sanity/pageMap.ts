import type { ComponentType } from "react";
import {
  BlockElementIcon, CogIcon, CommentIcon, DocumentIcon, EnvelopeIcon, HelpCircleIcon, ImageIcon,
  LinkIcon, MenuIcon, PinIcon, SearchIcon, StarIcon, TagIcon, ThListIcon, UsersIcon, WrenchIcon,
} from "@sanity/icons";
import { GROUPS } from "@/data/vehicles";

/**
 * What the admin shows for each page of the website, from the top of the page to the bottom.
 * Each entry opens the document that holds that content showing only that section's `fields`
 * (see SectionInput.tsx), or a list of documents (vehicle cards, reviews, FAQs...) in website order.
 */
export type Target =
  | { kind: "doc"; type: string; id?: string; fields: string[] }
  | { kind: "list"; type: string; filter?: string; params?: Record<string, unknown>; template?: { id: string; params: Record<string, unknown> } };

/** Documents listed under a section's fields (reviews, FAQs, vehicles...), opened to the right. */
export type ItemList = {
  title: string;
  type: string;
  filter?: string;
  params?: Record<string, unknown>;
  /** GROQ ordering, as on the website (default: Sort order, then oldest first). */
  sort?: string;
  /** Template for "Add" (defaults to a blank document of `type`); false hides the button. */
  template?: { id: string; params: Record<string, unknown> } | false;
};

export type SectionItem = {
  key: string;
  title: string;
  /** Shown under the title. */
  hint?: string;
  icon: ComponentType;
  target: Target;
  /** Section key from "Section order", so the list follows the editor's order. */
  slot?: string;
  /** Settings-like entries (SEO, full form). */
  meta?: boolean;
  /** Lists shown under the fields, so a heading and its items are edited in one place. */
  items?: ItemList[];
  /** "page/section", set by `withRefs`; lets the form find `items`. */
  ref?: string;
};

export type PageMap = {
  id: string;
  title: string;
  /** Document + field holding the editor's order ("layout" unless set). */
  layoutDoc?: string;
  layoutField?: string;
  sections: SectionItem[];
};

const doc = (type: string, fields: string | string[], id?: string): Target => ({ kind: "doc", type, id, fields: Array.isArray(fields) ? fields : [fields] });
const S = "siteSettings";

const seo = (type: string): SectionItem => ({ key: "seo", title: "Search & sharing (SEO)", icon: SearchIcon, target: doc(type, "seo"), meta: true });
const top = (type: string): SectionItem => ({ key: "top", title: "Page top", hint: "Heading & intro", icon: BlockElementIcon, target: doc(type, ["title", "intro", "image"]) });
const marquee: SectionItem = { key: "marquee", title: "Scrolling offers strip", hint: "Shared (Site settings)", icon: TagIcon, target: doc(S, "marquee"), slot: "marquee" };
const areas: SectionItem = { key: "areas", title: "Hyderabad areas", hint: "Shared (Site settings)", icon: PinIcon, target: doc(S, ["areasTitle", "areasText", "areas", "highlights"]), slot: "areas" };
const faqList: Target = { kind: "list", type: "faq" };
const ORDERED = "In website order (Sort order)";

const field = (key: string, title: string, type: string, path: string | string[], icon: ComponentType = BlockElementIcon, hint?: string): SectionItem => ({ key, title, hint, icon, target: doc(type, path) });
const docs = (key: string, title: string, type: string, icon: ComponentType, hint = ORDERED): SectionItem => ({ key, title, hint, icon, target: { kind: "list", type } });
const slotted = (slot: string, item: SectionItem): SectionItem => ({ ...item, slot });
const withItems = (item: SectionItem, ...items: ItemList[]): SectionItem => ({ ...item, items });
const all = (title: string, type: string): ItemList => ({ title, type });
const inGroup = (title: string, type: string, template: string, group: string): ItemList => ({
  title, type, filter: "group == $group", params: { group }, template: { id: template, params: { group } },
});

/** What each "Popular right now" tab shows, in the website's order: "Featured" vehicles first (up to 15). */
export function popularTab(tab: string): ItemList | undefined {
  if (tab === "drivers") return all("Drivers in this tab", "driver");
  const g = GROUPS.find((x) => x.id === tab);
  return g && { ...inGroup("Vehicles in this tab", "vehicle", "vehicle-by-group", g.id), sort: "featured desc, coalesce(order, 100) asc, name asc" };
}

const HOME: PageMap = {
  id: "home",
  title: "Home",
  layoutDoc: "homePage",
  sections: [
    slotted("hero", field("hero", "Hero", "homePage", ["slides", "heroTheme"], ImageIcon, "Slides and light / dark style")),
    { ...field("search-bar", "Search bar", "homePage", "searchBar", SearchIcon, "Tabs, buttons and forms. Also on each service page"), slot: "hero" },
    marquee,
    slotted("services", field("hub", "Everything on wheels", "homePage", "hub", WrenchIcon)),
    slotted("offers", field("offers", "Offers & deals", "homePage", "offers", TagIcon)),
    slotted("popular", field("popular", "Popular right now", "homePage", "featured", StarIcon)),
    areas,
    slotted("why", field("why", "Why rent with us", "homePage", "why")),
    slotted("how", field("how", "How booking works", "homePage", "how")),
    slotted("reviews", withItems(field("reviews", "Reviews", "homePage", "testimonials", CommentIcon), all("Customer reviews", "testimonial"))),
    slotted("partner", field("partner", "Attach your vehicle", "homePage", "partner")),
    slotted("corporate", field("corporate", "Corporate", "homePage", "corporate")),
    slotted("faq", withItems(field("faq", "FAQ", "homePage", "faq", HelpCircleIcon), all("Questions", "faq"))),
    slotted("final", field("final", "Final call to action", "homePage", "final")),
    seo("homePage"),
  ],
};

const groupPage = (g: (typeof GROUPS)[number]): PageMap => ({
  id: g.id,
  title: g.name,
  layoutDoc: "vehiclesPage",
  sections: [
    { key: "top", title: "Page top", icon: BlockElementIcon, target: doc("vehicleGroup", ["name", "blurb", "heroImage", "image"], `group-${g.id}`) },
    marquee,
    slotted("offers", field("offers", "Offers for you", "homePage", "offers", TagIcon)),
    slotted("vehicles", withItems(
      field("vehicles", "Vehicle list", "vehiclesPage", [...(g.id === "cars" ? ["listTitleCars", "listTitleMixed"] : ["listTitle"]), "emptyTitle", "emptyText", "outsideTitle", "outsideText"], ThListIcon),
      inGroup("Vehicles", "vehicle", "vehicle-by-group", g.id),
      inGroup("Filter chips (vehicle types)", "vehicleType", "type-by-group", g.id),
    )),
    ...(g.id === "cars" ? [areas] : []),
    slotted("faq", withItems(field("faq", "FAQ", "vehiclesPage", "faqTitle", HelpCircleIcon), all("Questions", "faq"))),
    seo("vehiclesPage"),
  ],
});

const simple = (id: string, title: string, type: string, middle: SectionItem[]): PageMap => ({
  id, title, sections: [top(type), ...middle, seo(type)],
});

/** Shown on every page; edited once (stored in Site settings). */
export const HEADER: PageMap = {
  id: "header",
  title: "Header",
  layoutDoc: S,
  layoutField: "navOrder",
  sections: [
    ...GROUPS.map((g): SectionItem => ({
      key: `menu-${g.id}`, title: g.short, hint: `Label for the ${g.name} link`, icon: MenuIcon, slot: g.id,
      target: doc("vehicleGroup", ["short", "name"], `group-${g.id}`),
    })),
    slotted("drivers", field("menu-drivers", "Drivers", S, "driversLabel", MenuIcon)),
    field("more", "More menu", S, "navMore", MenuIcon, "Always last. Also the mobile menu, in this order"),
  ],
};

export const FOOTER: PageMap = {
  id: "footer",
  title: "Footer",
  sections: [
    field("brand", "Tagline & short description", S, ["tagline", "footerBlurb"], DocumentIcon, "Under the footer logo"),
    field("columns", "Link columns", S, "footerColumns", MenuIcon, "Vehicles, Services, Company…"),
    field("contact-title", "Contact column heading", S, "footerContactTitle", EnvelopeIcon, "Phone & email come from Site settings"),
    field("copyright", "Copyright line", S, "copyright", DocumentIcon, "{year} becomes the current year"),
  ],
};

/** Brand assets and contact details used everywhere; page content stays on its page. */
export const SETTINGS: PageMap = {
  id: "settings",
  title: "Site settings",
  sections: [
    field("logos", "Logos", S, ["headerLogo", "logo", "shareImage"], ImageIcon, "Header logo, footer logo, share image"),
    field("numbers", "Phone & WhatsApp numbers", S, ["phone", "whatsappNumber"], EnvelopeIcon, "Call and WhatsApp buttons everywhere"),
    field("email", "Email & address", S, ["email", "address"], EnvelopeIcon),
    field("social", "Social links", S, "social", LinkIcon),
    field("display", "Display options", S, ["showPrices", "showIntro"], CogIcon, "Show prices, logo intro"),
    { key: "all", title: "All settings (full form)", icon: CogIcon, target: doc(S, []), meta: true },
  ],
};

export const PAGES: PageMap[] = [
  HOME,
  ...GROUPS.map(groupPage),
  simple("all-vehicles", "All vehicles page", "vehiclesPage", [
    withItems(field("vehicles", "Vehicle list", "vehiclesPage", ["emptyTitle", "emptyText"], ThListIcon), all("Vehicles", "vehicle")),
  ]),
  {
    id: "vehicle",
    title: "Vehicle details page",
    sections: [
      withItems(
        field("vehicles", "Vehicle pages", "vehiclesPage", ["stockPhotoNote", "detailQuoteTitle", "detailQuoteText"], ThListIcon, "One page per vehicle"),
        all("Vehicles", "vehicle"),
      ),
    ],
  },
  simple("drivers", "Drivers", "driversPage", [
    withItems(field("drivers", "Driver list", "driversPage", ["listTitle", "empty"], UsersIcon), all("Drivers", "driver")),
  ]),
  simple("services", "Services", "servicesPage", [
    withItems(field("services", "Services", "servicesPage", "confirmNote", WrenchIcon), all("Services (one block each)", "service")),
  ]),
  simple("corporate", "Corporate", "corporatePage", [
    field("uses", "Use cases", "corporatePage", ["uses", "groupsLabel"]),
    field("band", "Corporate band", "homePage", "corporate", BlockElementIcon, "Shared with Home"),
  ]),
  simple("partner", "Attach your vehicle", "partnerPage", [
    field("steps", "How it works (steps)", "partnerPage", "steps"),
    field("form", "Form", "partnerPage", ["formTitle", "formText"], EnvelopeIcon),
  ]),
  simple("careers", "Careers", "careersPage", [
    withItems(field("roles", "Open roles", "careersPage", ["rolesTitle", "note"], UsersIcon), all("Roles", "careerRole")),
    field("form", "Form", "careersPage", ["formTitle", "formText"], EnvelopeIcon),
  ]),
  simple("about", "About", "aboutPage", [
    field("story", "Our story", "aboutPage", ["heading", "image", "paragraphs"], DocumentIcon),
  ]),
  simple("faq", "FAQ", "faqPage", [docs("questions", "Questions", "faq", HelpCircleIcon)]),
  simple("contact", "Contact", "contactPage", [
    field("whatsapp", "WhatsApp card", "contactPage", ["whatsappTitle", "whatsappText", "whatsappCta"], EnvelopeIcon),
    field("details", "Phone, email & address", S, ["phone", "whatsappNumber", "email", "address"], EnvelopeIcon, "Shared with header & footer"),
    field("other", "Other ways to reach us", "contactPage", ["otherTitle", "emptyText"]),
  ]),
  simple("search", "Search results", "searchPage", [
    field("results", "Results", "searchPage", ["title", "intro", "resultsTitle", "requestCta", "detailsLabel", "editLabel", "othersTitle"], SearchIcon),
    field("drivers", "Drivers results", "searchPage", ["driversTitle", "driversEmpty", "driversEmptyCta"], UsersIcon),
    field("no-match", "No match", "searchPage", ["noMatchTitle", "noMatchText", "availabilityNote"]),
  ]),
  { id: "404", title: "404 (page not found)", sections: [field("text", "Heading, text & button", "notFoundPage", ["title", "text", "cta"])] },
].map(withRefs);

/** Gives every section a "page/section" ref so its form can find the section's item lists. */
function withRefs(page: PageMap): PageMap {
  return { ...page, sections: page.sections.map((it) => ({ ...it, ref: `${page.id}/${it.key}` })) };
}

/** The section a form was opened from (see SectionInput.tsx). */
export function findSection(ref: string): SectionItem | undefined {
  const pageId = ref.split("/")[0];
  return PAGES.find((p) => p.id === pageId)?.sections.find((it) => it.ref === ref);
}
