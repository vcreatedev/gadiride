import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityEnabled } from "./env";

export const client = sanityEnabled
  ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" })
  : null;
