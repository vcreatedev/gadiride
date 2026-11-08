import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import Photo from "./Photo";
import type { HeroFit, Photo as PhotoData } from "@/lib/images";
import { isSanityImage, sanityLoader } from "@/lib/sanityLoader";

/** Fade behind the text: across the left on wide screens, down from the top on upright ones. */
const FADE = {
  // Only behind the title and intro (left side on wide screens, top on upright ones); the rest of the
  // photo stays fully clear.
  dark: "bg-[linear-gradient(90deg,rgba(14,15,17,0.85)_0%,rgba(14,15,17,0.55)_30%,rgba(14,15,17,0)_55%)] portrait:bg-[linear-gradient(180deg,rgba(14,15,17,0.85)_0%,rgba(14,15,17,0.5)_35%,rgba(14,15,17,0)_60%)]",
  light: "bg-[linear-gradient(90deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.6)_30%,rgba(255,255,255,0)_55%)] portrait:bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.55)_35%,rgba(255,255,255,0)_60%)]",
};

/**
 * On a screen held upright, a wide photo is cropped to a tall slice and shown several times wider
 * than the screen, so it needs a much bigger file to stay sharp.
 */
/** The hero is never wider than the site frame (1280px). */
const FRAME_SIZES = "(min-width: 1280px) 1280px, 100vw";
const WIDE_SIZES = "(orientation: portrait) 300vw, (min-width: 1280px) 1280px, 100vw";

const heroImageProps = (p: PhotoData, sizes: string) =>
  getImageProps({ src: p.src, alt: "", fill: true, priority: true, quality: 90, sizes, loader: isSanityImage(p.src) ? sanityLoader : undefined }).props;

/**
 * The hero photo for every orientation. With an upright photo, the browser picks one of the two by
 * orientation and downloads only that one; each is framed on its own hotspot.
 */
/**
 * `fade`: the soft fade behind a headline (off for banner-only slides). `clearLeft`: with "show the
 * whole photo", keep the poster to the right 60% on wide screens so a headline on the left stays clear.
 */
export default function HeroPhotos({ wide, upright, dark, fit = "cover", fade: withFade = true, clearLeft = true }: { wide: PhotoData; upright?: PhotoData; dark: boolean; fit?: HeroFit; fade?: boolean; clearLeft?: boolean }) {
  const fade = withFade ? <div className={`absolute inset-0 ${dark ? FADE.dark : FADE.light}`} /> : null;
  // Whole photo: a blurred, enlarged copy fills the hero behind it, so there are no empty bands.
  // The poster sits on the right (bottom on upright screens), leaving the title's side to the blur.
  if (fit === "contain") {

    return (
      <>
        <Photo photo={wide} alt="" fill quality={40} sizes="50vw" className={`scale-110 object-cover blur-2xl ${upright ? "portrait:hidden" : ""}`} />
        {upright && <Photo photo={upright} alt="" fill quality={40} sizes="50vw" className="hidden scale-110 object-cover blur-2xl portrait:block" />}
        {/* On wide screens the poster keeps to the right 60%, clear of the headline on the left. */}
        <div className={`absolute inset-y-0 right-0 w-full ${clearLeft ? "lg:w-[60%]" : ""} ${upright ? "portrait:hidden" : ""}`}>
          <Photo photo={wide} alt="" fill priority quality={90} sizes={clearLeft ? "(min-width: 1280px) 770px, (min-width: 1024px) 60vw, 100vw" : FRAME_SIZES} className={`object-contain ${clearLeft ? "object-right portrait:object-bottom" : "object-center"}`} style={{ objectPosition: undefined }} />
        </div>
        {upright && <Photo photo={upright} alt="" fill priority quality={90} sizes={FRAME_SIZES} className="hidden object-contain object-bottom portrait:block" style={{ objectPosition: undefined }} />}
        {fade}
      </>
    );
  }
  if (!upright) {
    return (
      <>
        <Photo photo={wide} alt="" fill priority quality={90} sizes={WIDE_SIZES} className="object-cover object-center" />
        {fade}
      </>
    );
  }
  const w = heroImageProps(wide, FRAME_SIZES);
  const { style, ...img } = heroImageProps(upright, FRAME_SIZES);
  const frame = { "--pos-wide": wide.position ?? "50% 50%", "--pos-up": upright.position ?? "50% 50%" } as CSSProperties;
  return (
    <>
      <picture>
        <source media="(orientation: landscape)" srcSet={w.srcSet} sizes={w.sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element -- <picture> needs a plain img */}
        <img {...img} alt="" style={{ ...style, ...frame }} className="object-cover [object-position:var(--pos-wide)] portrait:[object-position:var(--pos-up)]" />
      </picture>
      {fade}
    </>
  );
}

