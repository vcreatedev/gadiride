import { defineType, type FieldDefinition } from "sanity";
import { formSettings, HEADING_HINT, heroFitField, heroImg, heroPhoneImg, img, sectionOrder, seo, str, strList, titleTextList, txt } from "./helpers";
import { VEHICLE_PAGE_SECTIONS } from "@/data/sections";

const content = { name: "content", title: "Content", default: true };
const seoGroup = { name: "seo", title: "SEO" };

/** Search has its own header, so no hero photo. */
const NO_HERO_PHOTO = ["searchPage"];

/** About's "image" is the photo beside its story, so its hero photos use their own names. */
const ABOUT_HERO: FieldDefinition[] = [
  heroImg("heroImage", "Hero background photo (optional)", { description: "Wide photo behind the page title. Remove it to go back to the standard background." }),
  heroFitField("heroFit"),
  heroPhoneImg("heroImageMobile"),
];

const heroPhotos = (name: string): FieldDefinition[] =>
  NO_HERO_PHOTO.includes(name)
    ? []
    : name === "aboutPage"
      ? ABOUT_HERO
      : [
        heroImg("image", "Hero background photo (optional)", { description: "Wide photo behind the page title. Remove it to go back to the standard background." }),
        heroFitField("imageFit"),
        heroPhoneImg("imageMobile"),
      ];

const page = (name: string, title: string, fields: FieldDefinition[]) =>
  defineType({
    name,
    title,
    type: "document",
    groups: [content, seoGroup],
    fields: [
      str("title", "Page heading", { group: "content", description: HEADING_HINT }),
      txt("intro", "Intro", { group: "content", rows: 2 }),
      ...[...heroPhotos(name), ...fields].map((f) => ({ ...f, group: "content" })),
      seo(),
    ],
    preview: { prepare: () => ({ title }) },
  });

export const vehiclesPage = page("vehiclesPage", "Vehicles pages", [
  sectionOrder(VEHICLE_PAGE_SECTIONS),
  str("quoteTitle", "Group page: quote heading"),
  txt("quoteText", "Group page: quote text", { rows: 2 }),
  str("faqTitle", "Group page: FAQ heading"),
  { ...str("offersTitle", "Group page: offers heading", { description: "Moved to Home → Offers & deals." }), hidden: true },
  str("listTitleCars", "Heading"),
  { ...str("listTitle", "Old shared list heading", { description: "Replaced by each page's own heading." }), hidden: true },
  str("listTitleMixed", "Heading when buses are shown", { description: "When a search has more people than a car seats." }),
  str("tripsHeading", "Today trips: heading", { description: "Above the trips when someone searches with Rental type “Today trip”." }),
  str("tripsEmptyTitle", "Today trips: no match heading"),
  txt("tripsEmpty", "Today trips: no match text", { rows: 2 }),
  str("tripsOthersTitle", "Today trips: heading above other trips"),
  str("outsideTitle", "No vehicles in the searched city: heading"),
  txt("outsideText", "No vehicles in the searched city: text", { rows: 2, description: "Shown when no vehicle's Location matches the searched pickup city." }),
  str("emptyTitle", "No results: heading"),
  txt("emptyText", "No results: text", { rows: 2 }),
  str("detailQuoteTitle", "Vehicle page: quote heading"),
  txt("detailQuoteText", "Vehicle page: quote text", { rows: 2 }),
  txt("stockPhotoNote", "Vehicle page: note under default photos", { rows: 2 }),
]);

export const servicesPage = page("servicesPage", "Services page", [
  txt("confirmNote", 'Note for services marked "to confirm"', { rows: 2 }),
]);

export const corporatePage = page("corporatePage", "Corporate page", [titleTextList("uses", "Use cases"), str("groupsLabel", "Label before the group chips")]);

export const careersPage = page("careersPage", "Careers page", [
  str("rolesTitle", "Roles heading"),
  txt("note", "Note under the roles", { rows: 2 }),
  str("formTitle", "Form heading"),
  txt("formText", "Form text", { rows: 2 }),
  formSettings("careers"),
]);

export const aboutPage = page("aboutPage", "About page", [
  str("heading", "Section heading"),
  strList("paragraphs", "Paragraphs", { description: "One item per paragraph." }),
  str("linksTitle", "Heading above the service links", { description: "e.g. Explore our services" }),
  img("image", "Photo (optional)", { description: "Team, office or fleet photo, shown beside the story. Best size: 1600 × 1200 px (4:3)." }),
]);

export const contactPage = page("contactPage", "Contact page", [
  str("whatsappTitle", "WhatsApp card heading"),
  txt("whatsappText", "WhatsApp card text", { rows: 2 }),
  str("whatsappCta", "WhatsApp button"),
  str("otherTitle", "Other contact heading"),
  txt("emptyText", "Text when no phone/email/address is set", { rows: 2 }),
]);

export const faqPage = page("faqPage", "FAQ page", []);

export const searchPage = page("searchPage", "Search results page", [
  str("resultsTitle", 'Results heading, after the count (e.g. "for your trip")'),
  str("othersTitle", "Heading for other options"),
  str("noMatchTitle", "No match: heading"),
  txt("noMatchText", "No match: text", { rows: 2 }),
  txt("availabilityNote", "Availability note", { rows: 2 }),
  str("requestCta", "Request button"),
  str("detailsLabel", "Details link"),
  str("driversTitle", "Drivers heading"),
  txt("driversEmpty", "Text when no drivers are listed", { rows: 2 }),
  str("driversEmptyCta", "Button when no drivers are listed"),
  { ...str("editLabel", "Edit search label"), hidden: true },
]);

export const driversPage = page("driversPage", "Drivers page", [
  str("listTitle", "Driver list heading"),
  txt("empty", "Text when no drivers are listed", { rows: 2 }),
]);

export const partnerPage = page("partnerPage", "Attach your vehicle page", [
  titleTextList("steps", "How it works"),
  str("formTitle", "Form heading"),
  txt("formText", "Form text", { rows: 2 }),
  formSettings("partner"),
]);

export const notFoundPage = defineType({
  name: "notFoundPage",
  title: "404 page",
  type: "document",
  fields: [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), str("cta", "Button")],
  preview: { prepare: () => ({ title: "404 page" }) },
});

export const pageTypes = [vehiclesPage, servicesPage, corporatePage, careersPage, aboutPage, contactPage, faqPage, searchPage, driversPage, partnerPage, notFoundPage];
