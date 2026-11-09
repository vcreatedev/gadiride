import type { MetadataRoute } from "next";
import { dataset } from "@/sanity/env";
import { SITE_URL, absoluteUrl } from "@/lib/siteUrl";

/** Search and AI answer engines that may read the public site (named so they are clearly welcome). */
const SEARCH_AND_AI_BOTS = [
  "Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "YandexBot",
  "OAI-SearchBot", "ChatGPT-User", "GPTBot", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Meta-ExternalAgent",
];
const PRIVATE = ["/admin", "/api/"];

/**
 * robots.txt: gadiride.com is open to search engines and AI answer engines (except the admin and
 * internal routes) and points them to the sitemap. dev.gadiride.com and previews stay out of search.
 */
export default function robots(): MetadataRoute.Robots {
  if (dataset !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: SEARCH_AND_AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
