import { defineType, type FieldDefinition } from "sanity";
import { HEADING_HINT, img, sectionOrder, seo, str, strList, titleTextList, txt } from "./helpers";
import { VEHICLE_PAGE_SECTIONS } from "@/data/sections";

const content = { name: "content", title: "Content", default: true };
const seoGroup = { name: "seo", title: "SEO" };

const page = (name: string, title: string, fields: FieldDefinition[]) =>
  defineType({
    name,
    title,
    type: "document",
    groups: [content, seoGroup],
    fields: [
      str("title", "Page heading", { group: "content", description: HEADING_HINT }),
      txt("intro", "Intro", { group: "content", rows: 2 }),
      ...fields.map((f) => ({ ...f, group: "content" })),
      seo(),
    ],
    preview: { prepare: () => ({ title }) },
  });

export const vehiclesPage = page("vehiclesPage", "Vehicles pages", [
  sectionOrder(VEHICLE_PAGE_SECTIONS),
  str("quoteTitle", "Group page: quote heading"),
  txt("quoteText", "Group page: quote text", { rows: 2 }),
  str("faqTitle", "Group page: FAQ heading"),
  str("offersTitle", "Group page: offers heading"),
  str("listTitleCars", "Cars page: vehicle list heading"),
  str("listTitle", "Other group pages: vehicle list heading", { description: "{group} becomes the group name, e.g. \"Our {group}.\"" }),
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
]);

export const aboutPage = page("aboutPage", "About page", [
  str("heading", "Section heading"),
  strList("paragraphs", "Paragraphs", { description: "One item per paragraph." }),
  img("image", "Photo (optional)", { description: "Team, office or fleet photo." }),
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
  str("editLabel", "Edit search label"),
]);

export const driversPage = page("driversPage", "Drivers page", [
  str("listTitle", "Driver list heading"),
  txt("empty", "Text when no drivers are listed", { rows: 2 }),
]);

export const partnerPage = page("partnerPage", "Attach your vehicle page", [
  titleTextList("steps", "How it works"),
  str("formTitle", "Form heading"),
  txt("formText", "Form text", { rows: 2 }),
]);

export const notFoundPage = defineType({
  name: "notFoundPage",
  title: "404 page",
  type: "document",
  fields: [str("title", "Heading", { description: HEADING_HINT }), txt("text", "Text", { rows: 2 }), str("cta", "Button")],
  preview: { prepare: () => ({ title: "404 page" }) },
});

export const pageTypes = [vehiclesPage, servicesPage, corporatePage, careersPage, aboutPage, contactPage, faqPage, searchPage, driversPage, partnerPage, notFoundPage];
