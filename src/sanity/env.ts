export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** False until a Sanity project ID is set. The site then serves the bundled sample data. */
export const sanityEnabled = /^[a-z0-9-]+$/.test(projectId);
