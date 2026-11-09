import type { Group, Vehicle } from "@/data/vehicles";
import { placeLabel } from "@/data/vehicles";
import type { FaqItem, ServiceItem, Settings } from "./content";
import { BRAND, DEFAULT_SHARE_IMAGE, shareImageUrl } from "./seo";
import { SITE_URL, absoluteUrl } from "./siteUrl";

/**
 * schema.org structured data (JSON-LD). Google uses it for rich results; ChatGPT, Perplexity,
 * Gemini and other answer engines use it to understand who Gadiride is, what it rents, where, and
 * at what price. Everything here mirrors what the page itself shows (prices only when shown).
 */

const CONTEXT = "https://schema.org";
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** A photo as a full address (site photos become absolute). */
const imageUrl = (src?: string) => (src ? absoluteUrl(src) : undefined);
const vehiclePath = (slug: string) => `/vehicle/${slug}/`;

/** Every city the business serves: Site settings' cities plus wherever a vehicle is based. */
export function servedCities(site: Settings, vehicles: Vehicle[]): string[] {
  return [...new Set([...site.cities.map((c) => c.name), ...vehicles.map((v) => v.location)].filter(Boolean))];
}

/** The business: a vehicle rental company with its contact details, area and services. */
export function organizationLd(site: Settings, groups: Group[], vehicles: Vehicle[]) {
  const [locality, region] = site.address.split(",").map((s) => s.trim());
  const logo = imageUrl(site.logo?.src ?? "/brand/gadiride-logo.webp");
  return {
    "@context": CONTEXT,
    "@type": "AutoRental",
    "@id": BUSINESS_ID,
    name: site.name || BRAND,
    url: absoluteUrl("/"),
    description: `${site.tagline} ${site.footerBlurb}`.trim(),
    slogan: site.tagline || undefined,
    logo,
    image: imageUrl(shareImageUrl(site.shareImage) ?? DEFAULT_SHARE_IMAGE),
    telephone: site.phone || undefined,
    email: site.email || undefined,
    address: { "@type": "PostalAddress", addressLocality: locality || "Hyderabad", addressRegion: region || "Telangana", addressCountry: "IN" },
    areaServed: servedCities(site, vehicles).map((name) => ({ "@type": "City", name })),
    sameAs: site.social.map((s) => s.href),
    contactPoint: site.phone
      ? [{ "@type": "ContactPoint", telephone: site.phone, contactType: "customer service", areaServed: "IN", ...(site.email ? { email: site.email } : {}) }]
      : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Vehicles on rent",
      itemListElement: groups.map((g) => ({
        "@type": "OfferCatalog",
        name: g.name,
        url: absoluteUrl(`/vehicles/${g.id}/`),
        description: g.blurb,
      })),
    },
  };
}

/** The website itself, published by the business. */
export function websiteLd(site: Settings) {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: site.name || BRAND,
    inLanguage: "en-IN",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** The trail of links above a page: Home › Cars › Maruti Swift. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

const spec = (v: Vehicle, re: RegExp) => v.specs.find((s) => re.test(s.label))?.value;
const firstNumber = (s?: string) => {
  const m = s?.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

/** One vehicle on rent: what it is, where it is, its photos and (when shown) its price per day. */
export function vehicleLd(v: Vehicle, showPrices: boolean) {
  const url = absoluteUrl(vehiclePath(v.slug));
  const seats = firstNumber(spec(v, /seat/i));
  const fuel = spec(v, /fuel/i);
  const gears = spec(v, /transmission|gear/i);
  const price = showPrices && v.pricePerDay ? v.pricePerDay : undefined;
  return {
    "@context": CONTEXT,
    "@type": v.group === "cars" ? "Car" : "Vehicle",
    "@id": `${url}#vehicle`,
    name: v.name,
    description: v.summary || undefined,
    url,
    image: [v.photo, ...v.gallery].map((p) => imageUrl(p.src)).filter(Boolean),
    category: [v.groupName, v.typeName].filter(Boolean).join(" › "),
    ...(seats ? { vehicleSeatingCapacity: seats } : {}),
    ...(fuel ? { fuelType: fuel } : {}),
    ...(gears ? { vehicleTransmission: gears } : {}),
    additionalProperty: v.specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
    offers: {
      "@type": "Offer",
      url,
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      availability: "https://schema.org/InStock",
      areaServed: { "@type": "City", name: v.location },
      availableAtOrFrom: { "@type": "Place", name: placeLabel(v), address: { "@type": "PostalAddress", addressLocality: v.location, addressCountry: "IN", ...(v.pincode ? { postalCode: v.pincode } : {}) } },
      seller: { "@id": BUSINESS_ID },
      ...(price
        ? {
            price,
            priceCurrency: "INR",
            priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "INR", unitCode: "DAY", unitText: "per day" },
          }
        : {}),
    },
  };
}

/** A page's list of vehicles, in the order shown. */
export function vehicleListLd(name: string, vehicles: Vehicle[]) {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name,
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v.name, url: absoluteUrl(vehiclePath(v.slug)) })),
  };
}

/** Questions and answers shown on a page (answer engines quote these directly). */
export function faqLd(items: FaqItem[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** The services page: each service the business offers, in the cities it serves. */
export function servicesLd(services: ServiceItem[], cities: string[]) {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: "Gadiride services",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.name,
        description: [s.offer, s.forWho].filter(Boolean).join(" "),
        url: absoluteUrl(`/services/#${s.id}`),
        provider: { "@id": BUSINESS_ID },
        areaServed: cities.map((name) => ({ "@type": "City", name })),
      },
    })),
  };
}
