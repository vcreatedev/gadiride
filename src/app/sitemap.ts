import type { MetadataRoute } from "next";
import { GROUPS } from "@/data/vehicles";
import { getVehicles } from "@/lib/content";
import { absoluteUrl } from "@/lib/siteUrl";

/** Rebuilt with the content (vehicles added or hidden in the admin show up within the hour). */
export const revalidate = 3600;

/** Pages that are not about one vehicle, with how much they matter to search. */
const PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  ...GROUPS.map((g) => ({ path: `/vehicles/${g.id}/`, priority: 0.9, changeFrequency: "daily" as const })),
  { path: "/vehicles/", priority: 0.8, changeFrequency: "daily" },
  { path: "/services/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/drivers/", priority: 0.7, changeFrequency: "weekly" },
  { path: "/corporate/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partner/", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about/", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/careers/", priority: 0.4, changeFrequency: "monthly" },
];

/**
 * sitemap.xml: every page Google should index, including each vehicle that is live right now
 * (vehicles hidden, ended or not yet live are left out). Search and trip pages are not listed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getVehicles();
  const latest = vehicles.map((v) => v.updatedAt).filter(Boolean).sort().pop();
  const now = new Date();
  return [
    ...PAGES.map((p) => ({ url: absoluteUrl(p.path), lastModified: p.path.startsWith("/vehicles") && latest ? new Date(latest) : now, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...vehicles
      .filter((v) => !v.sample)
      .map((v) => ({
        url: absoluteUrl(`/vehicle/${v.slug}/`),
        lastModified: v.updatedAt ? new Date(v.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: [v.photo, ...v.gallery].map((p) => absoluteUrl(p.src)),
      })),
  ];
}
