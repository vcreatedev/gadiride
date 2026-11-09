import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityEnabled } from "./env";

export const client = sanityEnabled
  ? // Sanity's CDN (apicdn.sanity.io): fast, cached at the edge and cleared by Sanity on every publish.
    // Next.js caches on top of it (see content.ts), so Sanity is only asked when the cache refreshes.
    createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;
