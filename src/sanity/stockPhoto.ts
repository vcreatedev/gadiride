import { createElement } from "react";
import { TYPES } from "@/data/vehicles";

/**
 * The built-in photo the website uses when neither the vehicle nor its type has one
 * (same rule as content.ts: the type's own photo, else the first type of the group).
 */
export function stockPhotoUrl(typeKey?: string, group?: string): string | undefined {
  const t = TYPES.find((x) => x.id === typeKey) ?? TYPES.find((x) => x.group === group);
  return t && `/vehicles/${t.id}.webp`;
}

/** List preview media for a built-in photo. */
export const stockMedia = (url?: string) =>
  url ? createElement("img", { src: url, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) : undefined;
