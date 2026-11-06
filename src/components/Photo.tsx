"use client";
import Image, { type ImageLoader, type ImageProps } from "next/image";
import type { Photo as PhotoData } from "@/lib/images";

/** Sanity's CDN resizes and converts to AVIF/WebP itself, so we skip Next's optimizer for it. */
const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const u = new URL(src);
  u.searchParams.set("w", String(width));
  u.searchParams.set("q", String(quality ?? 78));
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "max");
  return u.toString();
};

type Props = Omit<ImageProps, "src" | "alt" | "placeholder" | "blurDataURL"> & { photo: PhotoData; alt?: string };

/**
 * Responsive, lazy-loaded image. Pass `fill` + `sizes` inside a sized box (preferred),
 * or width/height. Sanity images get a blur-up preview and honour the editor's hotspot.
 */
export default function Photo({ photo, alt, style, fill, width, height, ...rest }: Props) {
  const isSanity = photo.src.startsWith("https://cdn.sanity.io/");
  const dims = fill ? {} : { width: width ?? photo.width ?? 1200, height: height ?? photo.height ?? 750 };
  return (
    <Image
      src={photo.src}
      alt={alt ?? photo.alt ?? ""}
      loader={isSanity ? sanityLoader : undefined}
      placeholder={photo.blur ? "blur" : "empty"}
      blurDataURL={photo.blur}
      fill={fill}
      {...dims}
      style={{ objectPosition: photo.position, ...style }}
      {...rest}
    />
  );
}
