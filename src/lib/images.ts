import { urlFor } from "@/sanity/image";

/** A display-ready image: Sanity CDN URL (crop applied) or a local /public path. */
export type Photo = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Tiny base64 preview from Sanity, used as a blur-up placeholder. */
  blur?: string;
  /** CSS object-position from the Sanity hotspot, e.g. "52% 60%". */
  position?: string;
};

export type SanityImageDoc = {
  asset?: { _ref: string };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number };
  alt?: string;
  lqip?: string;
  dim?: { width: number; height: number };
  /** Test copy mode only: the dataset the photo is stored in (live or test). */
  ds?: string | null;
} | null;

/**
 * GROQ projection used for every image field. `ds` is only set in test copy mode, where the
 * pages are built from live and test documents together (see fetchWithTestEdits in content.ts).
 */
export const IMG = `{asset, crop, hotspot, alt, "lqip": asset->metadata.lqip, "dim": asset->metadata.dimensions{width, height}, "ds": asset->_dataset}`;

/** How a hero photo fills the hero: "cover" crops to fill, "contain" shows it whole. */
export type HeroFit = "cover" | "contain";

export function toPhoto(img: SanityImageDoc | undefined, fallbackAlt?: string): Photo | undefined {
  if (!img?.asset?._ref) return undefined;
  const c = img.crop;
  const w = img.dim ? Math.round(img.dim.width * (1 - (c?.left ?? 0) - (c?.right ?? 0))) : undefined;
  const h = img.dim ? Math.round(img.dim.height * (1 - (c?.top ?? 0) - (c?.bottom ?? 0))) : undefined;
  return {
    src: urlFor(img, img.ds || undefined).url(),
    alt: img.alt || fallbackAlt,
    width: w,
    height: h,
    blur: img.lqip,
    position: img.hotspot ? `${Math.round(img.hotspot.x * 100)}% ${Math.round(img.hotspot.y * 100)}%` : undefined,
  };
}

export const localPhoto = (src: string, alt?: string): Photo => ({ src, alt });
