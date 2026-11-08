import type { SchemaTypeDefinition } from "sanity";
import { vehicle } from "./vehicle";
import { siteSettings } from "./siteSettings";
import { faq } from "./faq";
import { careerRole } from "./careerRole";
import { homePage } from "./homePage";
import { pageTypes } from "./pages";
import { driver, service, testimonial, vehicleGroup, vehicleType } from "./catalog";
import { withVisibility } from "./visibility";
import { trip } from "./trip";

export const schemaTypes = [
  homePage,
  ...pageTypes,
  vehicle,
  vehicleType,
  vehicleGroup,
  service,
  driver,
  trip,
  testimonial,
  faq,
  careerRole,
  siteSettings,
].map((t) => withVisibility(t as SchemaTypeDefinition));

/** One document each, with a fixed ID. */
export const SINGLETONS: Record<string, string> = {
  siteSettings: "Site settings",
  homePage: "Home page",
  vehiclesPage: "Vehicles pages",
  servicesPage: "Services page",
  corporatePage: "Corporate page",
  careersPage: "Careers page",
  aboutPage: "About page",
  contactPage: "Contact page",
  faqPage: "FAQ page",
  searchPage: "Search results page",
  driversPage: "Drivers page",
  partnerPage: "Attach your vehicle page",
  notFoundPage: "404 page",
};
