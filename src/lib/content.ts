import type { SectionSlot } from "@/data/sections";
import { cache } from "react";
import { client } from "@/sanity/client";
import { site as settingsDefaults, type Banner, type SiteSettings } from "@/config/site";
import type { FormOverride } from "@/data/forms";
import { TAB_IDS, type TabId } from "./search";
import {
  GROUPS,
  TYPES,
  VEHICLES,
  defaultTypePhoto,
  type Group,
  type GroupId,
  type PhotoBg,
  type PhotoFit,
  type VType,
  type Vehicle,
  type VehicleSeed,
} from "@/data/vehicles";
import { FAQ } from "@/data/faq";
import { SAMPLE_DRIVERS } from "@/data/drivers";
import { dataset } from "@/sanity/env";
import { CAREER_ROLES, SERVICES, type FormKey, type Service } from "@/data/services";
import type { ArtId } from "@/data/vehicleArt";
import { footerDefaults, homeDefaults, pageDefaults, type HomeContent, type PageContent, type PageKey } from "@/content/defaults";
import { IMG, toPhoto, type Photo, type SanityImageDoc } from "./images";

/**
 * All site content comes through here. One GROQ query per render (cached),
 * revalidated every 60s or immediately via /api/revalidate.
 * Empty Sanity fields fall back to src/content/defaults.ts and src/data,
 * so the site always renders, even on an empty dataset.
 */
export const SANITY_TAG = "sanity";
const REVALIDATE = 60;

/* ---------------------------------------------------------------- query */

const PAGE_TYPES = ["vehiclesPage", "servicesPage", "corporatePage", "careersPage", "aboutPage", "contactPage", "faqPage", "searchPage", "driversPage", "partnerPage", "notFoundPage"] as const;

const QUERY = `{
  "settings": *[_id == "siteSettings"][0]{..., logo${IMG}, headerLogo${IMG}, shareImage${IMG}},
  "home": *[_id == "homePage"][0]{..., seo{..., image${IMG}}},
  "pages": *[_id in $pageIds]{..., image${IMG}, seo{..., image${IMG}}},
  "groups": *[_type == "vehicleGroup"]{key, name, short, blurb, image${IMG}, heroImage${IMG}},
  "types": *[_type == "vehicleType" && hidden != true && defined(key.current)] | order(coalesce(order, 100) asc, name asc){
    "id": key.current, name, group, art, image${IMG}
  },
  "vehicles": *[_type == "vehicle" && available != false && defined(slug.current) && defined(group)]
    | order(coalesce(order, 100) asc, name asc){
      "slug": slug.current, name, group, summary, specs[hidden != true]{label, value}, options, pricePerDay, featured,
      photoFit, photoBackground, photoZoom,
      "type": type->key.current,
      image${IMG}, gallery[hidden != true]${IMG}
    },
  "services": *[_type == "service" && hidden != true && defined(key.current)] | order(coalesce(order, 100) asc, name asc){
    "id": key.current, name, forWho, offer, points, cta, form, toConfirm, image${IMG}
  },
  "faq": *[_type == "faq" && hidden != true && defined(question)] | order(coalesce(order, 100) asc, _createdAt asc){"q": question, "a": answer},
  "roles": *[_type == "careerRole" && hidden != true && defined(role)] | order(coalesce(order, 100) asc, _createdAt asc){role, detail},
  "drivers": *[_type == "driver" && available != false && defined(name)] | order(coalesce(order, 100) asc, name asc){
    name, city, experience, licence, duty, drives, languages, about, verified, photo${IMG}
  },
  "testimonials": *[_type == "testimonial" && hidden != true && defined(quote)] | order(coalesce(order, 100) asc, _createdAt desc){quote, name, detail, rating, photo${IMG}}
}`;

type Raw = {
  settings?: Record<string, unknown> | null;
  home?: Record<string, unknown> | null;
  pages?: ({ _id: string } & Record<string, unknown>)[];
  groups?: { key: GroupId; name?: string; short?: string; blurb?: string; image?: SanityImageDoc; heroImage?: SanityImageDoc }[];
  types?: { id: string; name: string; group: GroupId; art?: ArtId; image?: SanityImageDoc }[];
  vehicles?: {
    slug: string; name: string; group: GroupId; type?: string; summary?: string;
    specs?: { label: string; value: string }[]; options?: string[]; pricePerDay?: number; featured?: boolean;
    photoFit?: PhotoFit; photoBackground?: PhotoBg; photoZoom?: number;
    image?: SanityImageDoc; gallery?: SanityImageDoc[];
  }[];
  services?: { id: string; name: string; forWho?: string; offer?: string; points?: string[]; cta?: string; form?: FormKey; toConfirm?: boolean; image?: SanityImageDoc }[];
  faq?: { q: string; a: string }[];
  roles?: { role: string; detail: string }[];
  drivers?: { name: string; city?: string; experience?: number; licence?: string; duty?: string; drives?: string[]; languages?: string[]; about?: string; verified?: boolean; photo?: SanityImageDoc }[];
  testimonials?: { quote: string; name: string; detail?: string; rating?: number; photo?: SanityImageDoc }[];
};

const fetchRaw = cache(async (): Promise<Raw> => {
  if (!client) return {};
  try {
    return (
      (await client.fetch<Raw>(QUERY, { pageIds: [...PAGE_TYPES] }, { next: { revalidate: REVALIDATE, tags: [SANITY_TAG] } })) ?? {}
    );
  } catch (err) {
    console.warn("[sanity] fetch failed, using bundled content:", (err as Error).message);
    return {};
  }
});

/* ---------------------------------------------------------------- merge */

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** List items switched off with the eye in the Studio. */
const isHidden = (v: unknown) => isObj(v) && v.hidden === true;

/**
 * Deep-merge: non-empty values from Sanity win, empty ones keep the default. Arrays are replaced
 * when non-empty, without the items hidden in the Studio (all hidden = an empty list).
 */
function merge<T>(base: T, over: unknown): T {
  if (over === undefined || over === null || over === "") return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(over) || over.length === 0) return base;
    const shown = over.filter((o) => !isHidden(o));
    if (shown.length === 0) return [] as T;
    const item = base[0];
    return shown.map((o, i) => (isObj(item) ? merge((base[i] ?? item) as unknown, o) : o)) as T;
  }
  if (isObj(base)) {
    if (!isObj(over)) return base;
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(base)) out[k] = merge(base[k], over[k]);
    return out as T;
  }
  return (typeof over === typeof base ? over : base) as T;
}

/* ---------------------------------------------------------------- settings */

/** Hero style is edited on Home → Hero; older datasets still have it in Site settings. */
const themeOf = (v: unknown): SiteSettings["heroTheme"] | undefined => (v === "dark" || v === "light" ? v : undefined);

export type Settings = SiteSettings & { footerBlurb: string; logo?: Photo; headerLogo?: Photo; shareImage?: Photo; showIntro: boolean };

export const getSettings = cache(async (): Promise<Settings> => {
  const raw = await fetchRaw();
  const s = raw.settings ?? {};
  const base = { ...settingsDefaults, footerBlurb: footerDefaults.blurb, showIntro: true };
  const m = merge(base, s);
  return {
    ...m,
    whatsappNumber: m.whatsappNumber.replace(/\D/g, ""),
    cities: (m.cities ?? []).filter((c) => c?.name),
    social: (m.social ?? []).filter((x) => x?.label && x?.href),
    marquee: (m.marquee ?? []).filter(Boolean),
    areas: (m.areas ?? []).filter(Boolean),
    banners: (m.banners ?? []).filter((b) => b?.title),
    showPrices: typeof s.showPrices === "boolean" ? s.showPrices : settingsDefaults.showPrices,
    showIntro: typeof s.showIntro === "boolean" ? s.showIntro : true,
    heroTheme: themeOf(raw.home?.heroTheme) ?? themeOf(s.heroTheme) ?? settingsDefaults.heroTheme,
    navMore: (m.navMore ?? []).filter((l) => l?.label && l?.href),
    navOrder: Array.isArray(s.navOrder) ? (s.navOrder as SectionSlot[]).filter((r) => r?.key) : undefined,
    footerColumns: (m.footerColumns ?? []).filter((c) => c?.title).map((c) => ({ ...c, links: (c.links ?? []).filter((l) => l?.label && l?.href) })),
    logo: toPhoto(s.logo as SanityImageDoc, "Gadiride"),
    headerLogo: toPhoto(s.headerLogo as SanityImageDoc, "Gadiride"),
    shareImage: toPhoto(s.shareImage as SanityImageDoc),
  };
});

/* ---------------------------------------------------------------- pages */

type WithSeoImage = { seoImage?: Photo };

export const getHome = cache(async (): Promise<HomeContent & WithSeoImage> => {
  const h = (await fetchRaw()).home ?? {};
  return { ...merge(homeDefaults, h), seoImage: toPhoto((h.seo as { image?: SanityImageDoc } | undefined)?.image) };
});

/** The search bar's texts and each service's form as edited in Home → Search bar. */
export type SearchBar = {
  badge: string;
  tabs: Record<TabId, { label: string; search: string }>;
  forms: Partial<Record<FormKey, FormOverride>>;
};

export const getSearchBar = cache(async (): Promise<SearchBar> => {
  const home = await getHome();
  const sb = home.searchBar;
  return {
    badge: sb.badge,
    tabs: Object.fromEntries(TAB_IDS.map((t) => [t, { label: sb[t].label, search: sb[t].search }])) as SearchBar["tabs"],
    forms: { ...Object.fromEntries(TAB_IDS.map((t) => [t, sb[t].form])), corporate: home.corporate.form },
  };
});

/**
 * Offer banners live on Home → Offers & deals. Datasets not migrated yet still have them in
 * Site settings, so those are used until the home page has its own list.
 */
export const getBanners = cache(async (): Promise<Banner[]> => {
  const raw = ((await fetchRaw()).home?.offers as { banners?: unknown } | undefined)?.banners;
  if (!Array.isArray(raw)) return (await getSettings()).banners;
  return merge(settingsDefaults.banners, raw).filter((b) => b?.title);
});

export async function getPage<K extends PageKey>(key: K): Promise<PageContent[K] & WithSeoImage & { image?: Photo }> {
  const raw = (await fetchRaw()).pages?.find((p) => p._id === `${key}Page`) ?? {};
  const merged = merge(pageDefaults[key], raw) as PageContent[K];
  return {
    ...(merged as object),
    image: toPhoto((raw as { image?: SanityImageDoc }).image),
    seoImage: toPhoto((raw as { seo?: { image?: SanityImageDoc } }).seo?.image),
  } as unknown as PageContent[K] & WithSeoImage & { image?: Photo };
}

/** Next.js metadata for a page, from its SEO fields. */
export async function pageMetadata(key: PageKey | "home") {
  const [p, s] = await Promise.all([key === "home" ? getHome() : getPage(key), getSettings()]);
  const seo = (p as { seo?: { title: string; description: string } }).seo;
  const img = p.seoImage ?? s.shareImage;
  return {
    title: key === "home" ? { absolute: seo?.title ?? "Gadiride" } : seo?.title,
    description: seo?.description,
    openGraph: img ? { images: [{ url: shareUrl(img) }] } : undefined,
  };
}

const shareUrl = (p: Photo) => (p.src.startsWith("https://cdn.sanity.io/") ? `${p.src}${p.src.includes("?") ? "&" : "?"}w=1200&h=630&fit=crop&auto=format` : p.src);

/* ---------------------------------------------------------------- catalog */

export const getGroups = cache(async (): Promise<Group[]> => {
  const raw = (await fetchRaw()).groups ?? [];
  return GROUPS.map((g) => {
    const r = raw.find((x) => x.key === g.id);
    return { ...g, name: r?.name || g.name, short: r?.short || g.short, blurb: r?.blurb || g.blurb, photo: toPhoto(r?.image, r?.name || g.name), heroPhoto: toPhoto(r?.heroImage) };
  });
});

export const getTypes = cache(async (): Promise<VType[]> => {
  const raw = (await fetchRaw()).types ?? [];
  if (!raw.length) return TYPES.map((t) => ({ ...t, photo: defaultTypePhoto(t.id, t.name) }));
  return raw
    .filter((t) => GROUPS.some((g) => g.id === t.group))
    .map((t) => {
      const known = TYPES.find((x) => x.id === t.id);
      const fallback = known ?? TYPES.find((x) => x.group === t.group)!;
      return {
        id: t.id,
        name: t.name,
        group: t.group,
        art: t.art ?? fallback.art,
        color: known?.color ?? "#C9CDD3",
        photo: toPhoto(t.image, t.name) ?? defaultTypePhoto(fallback.id, t.name),
      };
    });
});

export const getVehicles = cache(async (): Promise<Vehicle[]> => {
  const [raw, groups, types] = await Promise.all([fetchRaw(), getGroups(), getTypes()]);
  const groupName = (id: GroupId) => groups.find((g) => g.id === id)?.name ?? id;
  const fromSeed = (v: VehicleSeed): Vehicle => {
    const t = types.find((x) => x.id === v.type);
    return {
      ...v,
      groupName: groupName(v.group),
      typeName: t?.name ?? v.type,
      photo: t?.photo ?? defaultTypePhoto(v.type, v.name),
      ownPhoto: false,
      gallery: [],
      fit: "cover",
      bg: "studio",
      zoom: 100,
    };
  };
  const docs = raw.vehicles ?? [];
  const list = docs
    .map((d): Vehicle | null => {
      const t = types.find((x) => x.id === d.type) ?? types.find((x) => x.group === d.group);
      if (!t) return null;
      const own = toPhoto(d.image, d.name);
      return {
        slug: d.slug,
        name: d.name,
        type: t.id,
        group: d.group,
        art: t.art,
        color: t.color,
        specs: (d.specs ?? []).filter((s) => s?.label && s?.value),
        summary: d.summary ?? "",
        options: d.options ?? [],
        pricePerDay: d.pricePerDay ?? undefined,
        featured: !!d.featured,
        groupName: groupName(d.group),
        typeName: t.name,
        photo: own ?? { ...t.photo, alt: d.name },
        ownPhoto: !!own,
        gallery: (d.gallery ?? []).map((g) => toPhoto(g, d.name)).filter((p): p is Photo => !!p),
        fit: d.photoFit ?? "cover",
        bg: d.photoBackground ?? "studio",
        zoom: d.photoZoom ?? 100,
      };
    })
    .filter((v): v is Vehicle => !!v);
  return list.length ? list : VEHICLES.map(fromSeed);
});

export const getVehicle = async (slug: string) => (await getVehicles()).find((v) => v.slug === slug);

export const getFeaturedVehicles = async (limit = 6) => {
  const all = await getVehicles();
  const picked = all.filter((v) => v.featured);
  return (picked.length ? picked : all).slice(0, limit);
};

export type ServiceItem = Service & { photo: Photo };
const ART_PHOTO: Record<ArtId, string> = { hatch: "hatchback", sedan: "sedan", suv: "suv", pickup: "pickup", van: "tempo", truck: "truck", bus: "bus", jcb: "jcb" };

export const getServices = cache(async (): Promise<ServiceItem[]> => {
  const raw = (await fetchRaw()).services ?? [];
  if (!raw.length) return SERVICES.map((s) => ({ ...s, photo: defaultTypePhoto(ART_PHOTO[s.art], s.name) }));
  return raw.map((r) => {
    const known = SERVICES.find((s) => s.id === r.id);
    const art = known?.art ?? "sedan";
    return {
      id: r.id,
      name: r.name,
      forWho: r.forWho ?? "",
      offer: r.offer ?? "",
      points: r.points ?? [],
      cta: r.cta || "Get a quote",
      form: r.form ?? "cars",
      art,
      color: known?.color ?? "#DADDE2",
      toConfirm: !!r.toConfirm,
      photo: toPhoto(r.image, r.name) ?? defaultTypePhoto(ART_PHOTO[art], r.name),
    };
  });
});

/* ---------------------------------------------------------------- lists */

export type FaqItem = { q: string; a: string; group?: string };

export const getFaq = cache(async (): Promise<{ items: FaqItem[]; sample: boolean }> => {
  const docs = (await fetchRaw()).faq ?? [];
  return docs.length ? { items: docs, sample: false } : { items: FAQ, sample: true };
});

export type CareerRole = { role: string; detail: string };

export const getCareerRoles = cache(async (): Promise<CareerRole[]> => {
  const docs = (await fetchRaw()).roles ?? [];
  return docs.length ? docs : CAREER_ROLES;
});

export type Driver = {
  name: string; city?: string; experience?: number; licence?: string; duty?: string;
  drives: string[]; languages: string[]; about?: string; verified: boolean; photo?: Photo;
  /** Sample profile shown only on development / preview builds. */
  sample?: boolean;
};

/**
 * Real driver profiles from the admin. While none are published, development and preview
 * builds show labelled sample profiles; the production site never does.
 */
export const getDrivers = cache(async (): Promise<Driver[]> => {
  const docs = (await fetchRaw()).drivers ?? [];
  if (docs.length) return docs.map((d) => ({ ...d, drives: d.drives ?? [], languages: d.languages ?? [], verified: !!d.verified, photo: toPhoto(d.photo, d.name) }));
  if (dataset === "production") return [];
  return SAMPLE_DRIVERS.map((d) => ({ ...d, verified: false, sample: true }));
});

export type Testimonial = { quote: string; name: string; detail?: string; rating: number; photo?: Photo };

/** Only real reviews: no defaults. The section is hidden when empty. */
export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  ((await fetchRaw()).testimonials ?? []).map((t) => ({ ...t, rating: t.rating ?? 5, photo: toPhoto(t.photo, t.name) })),
);
