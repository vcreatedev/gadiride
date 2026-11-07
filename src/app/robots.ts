import type { MetadataRoute } from "next";
import { dataset } from "@/sanity/env";

/** gadiride.com is indexed (except the admin); dev.gadiride.com and previews are kept out of search. */
export default function robots(): MetadataRoute.Robots {
  if (dataset !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] } };
}
