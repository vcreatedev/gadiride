export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** False until a Sanity project ID is set. The site then serves the bundled sample data. */
export const sanityEnabled = /^[a-z0-9-]+$/.test(projectId);

/** The live content (gadiride.com). */
export const LIVE_DATASET = "production";

/**
 * Test copy mode (dev.gadiride.com and the local server, dataset "development"): the site shows the
 * live content with the documents edited in this admin on top. Only those edits are stored in this
 * dataset, and an hourly job deletes them after an hour. The live dataset is only ever read.
 */
export const testOverlay = sanityEnabled && dataset !== LIVE_DATASET;
