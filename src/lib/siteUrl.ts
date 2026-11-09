/**
 * The site's public address. Canonical links, the sitemap, structured data and llms.txt all use it,
 * so search engines always see gadiride.com (never www., dev. or a preview address).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://gadiride.com").replace(/\/+$/, "");

/** A site path as a full address, with the site's trailing slash: "/vehicles/cars" -> "https://gadiride.com/vehicles/cars/". */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  const keepAsIs = p === "/" || p.endsWith("/") || /[?#]/.test(p) || /\.[a-z0-9]+$/i.test(p);
  return `${SITE_URL}${keepAsIs ? p : `${p}/`}`;
}
