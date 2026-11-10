import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityEnabled } from "./env";

/**
 * With the publish webhook on (SANITY_REVALIDATE_SECRET set, as on gadiride.com) Sanity is asked
 * only right after a publish or once an hour, so read it directly: always the just-published
 * version, never a CDN copy that is a few seconds behind (that copy would then be cached for an hour).
 * Without the webhook (dev site), content refreshes every minute, so use Sanity's CDN
 * (apicdn.sanity.io): fast, and those reads do not count against the API quota.
 */
const useCdn = !process.env.SANITY_REVALIDATE_SECRET;

export const client = sanityEnabled
  ? createClient({ projectId, dataset, apiVersion, useCdn, perspective: "published" })
  : null;
