import type { Metadata } from "next";
import type { Photo } from "./images";
import { absoluteUrl } from "./siteUrl";

export const BRAND = "Gadiride";
/** The share card used when a page has no image of its own. */
export const DEFAULT_SHARE_IMAGE = "/brand/og.jpg";
/** Google shows about this many characters of a description. */
const DESCRIPTION_MAX = 160;

/** Where each content page lives (its canonical address). */
export const PAGE_PATH = {
  home: "/",
  vehicles: "/vehicles/",
  services: "/services/",
  corporate: "/corporate/",
  careers: "/careers/",
  about: "/about/",
  contact: "/contact/",
  faq: "/faq/",
  search: "/search/",
  drivers: "/drivers/",
  partner: "/partner/",
  notFound: "/",
} as const;

/** Pages kept out of search results (but their links are still followed). */
const NOINDEX_PAGES = new Set<string>(["search", "notFound"]);
export const isNoindexPage = (key: string) => NOINDEX_PAGES.has(key);

/** A 1200 × 630 share image: Sanity photos are cropped to size by the image CDN. */
export function shareImageUrl(photo?: Photo): string | undefined {
  if (!photo?.src) return undefined;
  if (!photo.src.startsWith("https://cdn.sanity.io/")) return photo.src;
  return `${photo.src}${photo.src.includes("?") ? "&" : "?"}w=1200&h=630&fit=crop&auto=format`;
}

/** Trims a description to what Google shows, on a word boundary. */
export function clampDescription(text?: string): string | undefined {
  const t = text?.replace(/\s+/g, " ").trim();
  if (!t || t.length <= DESCRIPTION_MAX) return t || undefined;
  const cut = t.slice(0, DESCRIPTION_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

type MetaInput = {
  /** Page title; " | Gadiride" is added unless `absoluteTitle`. */
  title?: string;
  absoluteTitle?: boolean;
  description?: string;
  /** Site path, e.g. "/vehicles/cars/". */
  path: string;
  /** Share image URL (absolute or site path). */
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
};

/**
 * Everything search engines and link previews read for one page: title, description, canonical
 * address, Open Graph and Twitter cards, and noindex when a page should stay out of results.
 */
export function buildMetadata({ title, absoluteTitle, description, path, image, imageAlt, noindex }: MetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title ? (absoluteTitle ? title : `${title} | ${BRAND}`) : undefined;
  const desc = clampDescription(description);
  const images = [{ url: image || DEFAULT_SHARE_IMAGE, width: 1200, height: 630, alt: imageAlt || fullTitle || BRAND }];
  return {
    title: title ? (absoluteTitle ? { absolute: title } : title) : undefined,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "en_IN", siteName: BRAND, url, title: fullTitle, description: desc, images },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
