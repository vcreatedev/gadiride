import { defineCliConfig } from "sanity/cli";

// The Sanity CLI does not read NEXT_PUBLIC_* from .env.local, so the (non-secret) project ID is the fallback.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "imd3p4ax",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "development",
  },
});
