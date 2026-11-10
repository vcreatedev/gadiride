import type { SectionSlot } from "@/data/sections";
import type { ArtId } from "@/data/vehicleArt";

/**
 * Default business details. Once Sanity is connected, these are overridden by
 * "Site settings" in the admin (/admin). Empty values are hidden on the site, never faked.
 */
export type BannerTone = "brand" | "dark" | "taxi" | "light";
export type Banner = {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  /** A page link (/vehicles/cars/#all), "tel" to call, or "whatsapp" to chat. */
  href: string;
  tone: BannerTone;
  art: ArtId;
  color: string;
  /** Service page it shows on. */
  group: string;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  /** International format, digits only, e.g. "919876543210". Empty = WhatsApp opens without a preset contact. */
  whatsappNumber: string;
  /** e.g. "+91 98765 43210". Empty = Call links hidden. */
  phone: string;
  email: string;
  address: string;
  /** Empty = "Cities we serve" section hidden. */
  cities: { name: string; note?: string }[];
  social: { label: string; href: string }[];
  /** Scrolling strip under the service-page hero. */
  marquee: string[];
  /** Offer banners on the service pages. */
  banners: Banner[];
  /** Hyderabad areas we deliver to / pick up from (cars page and location suggestions). */
  areasTitle: string;
  areasText: string;
  areas: string[];
  highlights: { title: string; text: string }[];
  /** Look of every page hero: "light" (daytime, default) or "dark" (night). */
  heroTheme: "light" | "dark";
  /** Header menu order (vehicle groups and Drivers); empty = default order. */
  navOrder?: SectionSlot[];
  /** Header label for the Drivers link. */
  driversLabel: string;
  /** Header "More" menu (and mobile menu) links, after the vehicle groups. */
  navMore: NavLink[];
  /** Footer link columns, in order. The contact column is added after them. */
  footerColumns: { title: string; links: NavLink[] }[];
  footerContactTitle: string;
  /** Label of the contact-page link in the footer's contact column; empty hides it. */
  footerContactLink: string;
  /** "{year}" is replaced with the current year. */
  copyright: string;
  /** Footer heading above the social icons, and whether the icons show. */
  socialTitle: string;
  showSocial: boolean;
  /** Whether the "Website developed by" credit shows. */
  showCredit: boolean;
  /** Footer credit, e.g. "Website developed by" + a linked name. Empty name hides it. */
  creditLabel: string;
  creditName: string;
  creditUrl: string;
};

export type NavLink = { label: string; href: string };

const PHONE = "+91 94915 44981";

export const site: SiteSettings = {
  name: "Gadiride",
  tagline: "Every vehicle. One ride.",
  whatsappNumber: "919491544981",
  phone: PHONE,
  email: "gadirideofficial@gmail.com",
  address: "Hyderabad, Telangana",
  cities: [
    { name: "Hyderabad", note: "Self drive and chauffeur cars across the city, with airport delivery." },
    { name: "Secunderabad", note: "Doorstep delivery and pickup." },
    { name: "Warangal", note: "Cars on request." },
    { name: "Vijayawada", note: "Cars on request." },
  ],
  social: [{ label: "Instagram", href: "https://www.instagram.com/gadirideofficial/" }],
  marquee: [
    "Self drive cars from ₹1,199 a day",
    "Zero deposit option on select cars",
    "Unlimited km plans",
    "Doorstep delivery across Hyderabad",
    "Airport delivery at RGIA, Shamshabad",
    "24×7 roadside help",
    "Weekday and long-trip discounts",
    "Chauffeur-driven cars for outstation trips",
  ],
  banners: [
    {
      eyebrow: "Self drive", title: "Cars from ₹1,199 a day.", text: "Hatchbacks, sedans and SUVs across Hyderabad. Pick up near you or get it delivered.",
      cta: "See all cars", href: "/vehicles/cars/#all", tone: "brand", art: "hatch", color: "#FFFFFF", group: "cars",
    },
    {
      eyebrow: "Airport", title: "Landing at RGIA?", text: "Your car waits at Shamshabad airport. Drive straight home or onward.",
      cta: "Book on WhatsApp", href: "whatsapp", tone: "dark", art: "sedan", color: "#FFC20E", group: "cars",
    },
    {
      eyebrow: "Zero deposit", title: "Skip the big deposit.", text: "Zero deposit option on select cars. Ask our team when you book.",
      cta: `Call ${PHONE.replace("+91 ", "")}`, href: "tel", tone: "taxi", art: "suv", color: "#16161A", group: "cars",
    },
    {
      eyebrow: "Long trips", title: "More days, lower price.", text: "Weekly and monthly plans with unlimited km. Ideal for road trips and work stints.",
      cta: "Get a quote", href: "whatsapp", tone: "brand", art: "suv", color: "#F4F5F7", group: "cars",
    },
    {
      eyebrow: "With driver", title: "Sit back, we drive.", text: "Chauffeur-driven Innova and Fortuner for weddings, guests and outstation trips.",
      cta: "Car with driver", href: "/search/?tab=cars&mode=With%20driver", tone: "dark", art: "suv", color: "#F4F5F7", group: "cars",
    },
    {
      eyebrow: "Group trips", title: "Weddings & pilgrimages.", text: "AC tempo travellers and buses with experienced drivers, local or outstation.",
      cta: "Plan group travel", href: "/vehicles/passenger/", tone: "taxi", art: "van", color: "#F4F5F7", group: "passenger",
    },
    {
      eyebrow: "Shifting?", title: "Trucks with helpers.", text: "House shifting and shop stock moved the same day, with loading helpers on request.",
      cta: "Book a truck", href: "/vehicles/logistics/", tone: "brand", art: "truck", color: "#1F4E79", group: "logistics",
    },
    {
      eyebrow: "Site work", title: "JCB by the hour.", text: "Backhoe loaders with trained operators for digging, loading and levelling.",
      cta: "Hire a JCB", href: "/vehicles/equipment/", tone: "dark", art: "jcb", color: "#FFC20E", group: "equipment",
    },
    {
      eyebrow: "Drivers", title: "Trusted drivers on call.", text: "Verified, uniformed drivers for your own car. Local runs or long trips.",
      cta: "Find a driver", href: "/drivers/", tone: "taxi", art: "sedan", color: "#2E2E34", group: "driver",
    },
  ],
  areasTitle: "Self drive cars across Hyderabad.",
  areasText:
    "Pick up from the area nearest to you, or get the car delivered to your door. Airport delivery at Rajiv Gandhi International Airport (RGIA), Shamshabad.",
  areas: [
    "Ameerpet", "Banjara Hills", "Jubilee Hills", "Madhapur", "Hitech City", "Gachibowli", "Kondapur", "Kukatpally",
    "KPHB Colony", "Miyapur", "Manikonda", "Begumpet", "Secunderabad", "Kompally", "Uppal", "LB Nagar",
    "Dilsukhnagar", "Mehdipatnam", "Attapur", "Tolichowki", "Nizampet", "Bachupally", "ECIL", "Shamshabad (RGIA)",
  ],
  heroTheme: "light",
  driversLabel: "Drivers",
  navMore: [
    { label: "All vehicles", href: "/vehicles/" },
    { label: "All services", href: "/services/" },
    { label: "Corporate", href: "/corporate/" },
    { label: "Attach your vehicle", href: "/partner/" },
    { label: "Careers", href: "/careers/" },
    { label: "About us", href: "/about/" },
    { label: "FAQ", href: "/faq/" },
    { label: "Contact", href: "/contact/" },
  ],
  footerColumns: [
    {
      title: "Vehicles",
      links: [
        { label: "Cars", href: "/vehicles/cars/" },
        { label: "Passenger vehicles", href: "/vehicles/passenger/" },
        { label: "Logistics vehicles", href: "/vehicles/logistics/" },
        { label: "Heavy equipment", href: "/vehicles/equipment/" },
        { label: "Drivers", href: "/drivers/" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Car rental", href: "/services/#car-rental" },
        { label: "Passenger transport", href: "/services/#passenger-transport" },
        { label: "Logistics and goods transport", href: "/services/#logistics" },
        { label: "Heavy equipment hire", href: "/services/#heavy-equipment" },
        { label: "Corporate transport and fleet", href: "/services/#corporate" },
        { label: "Driver services", href: "/services/#driver-services" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/about/" },
        { label: "Attach your vehicle", href: "/partner/" },
        { label: "Careers", href: "/careers/" },
        { label: "Corporate", href: "/corporate/" },
        { label: "FAQ", href: "/faq/" },
      ],
    },
  ],
  footerContactTitle: "Contact",
  footerContactLink: "Contact page",
  copyright: "© {year} Gadiride. All rights reserved.",
  socialTitle: "Follow us",
  showSocial: true,
  showCredit: true,
  creditLabel: "Website developed by",
  creditName: "Vcreate",
  creditUrl: "https://www.vcreateofficial.com/",
  highlights: [
    { title: "Zero deposit option", text: "On select cars, so more of your money stays with you." },
    { title: "Unlimited km plans", text: "Drive as far as the trip takes you, no meter anxiety." },
    { title: "Delivered to you", text: "Doorstep and airport delivery anywhere in Hyderabad." },
    { title: "24×7 roadside help", text: "Breakdown or flat tyre, one call and we sort it." },
  ],
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
