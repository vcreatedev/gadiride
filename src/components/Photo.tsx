"use client";
import Image, { type ImageProps } from "next/image";
import type { Photo as PhotoData } from "@/lib/images";
import { isSanityImage, sanityLoader } from "@/lib/sanityLoader";

type Props = Omit<ImageProps, "src" | "alt" | "placeholder" | "blurDataURL"> & { photo: PhotoData; alt?: string };

/**
 * Responsive, lazy-loaded image. Pass `fill` + `sizes` inside a sized box (preferred),
 * or width/height. Sanity images get a blur-up preview and honour the editor's hotspot.
 */
export default function Photo({ photo, alt, style, fill, width, height, ...rest }: Props) {
  const isSanity = isSanityImage(photo.src);
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
