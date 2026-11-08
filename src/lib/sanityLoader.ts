import type { ImageLoader } from "next/image";

/** Sanity's CDN resizes and converts to AVIF/WebP itself, so we skip Next's optimizer for it. */
export const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const u = new URL(src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", String(quality ?? 78));
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "max");
  return u.toString();
};

export const isSanityImage = (src: string) => src.startsWith("https://cdn.sanity.io/");
