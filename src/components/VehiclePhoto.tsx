import Photo from "./Photo";
import type { Photo as PhotoData } from "@/lib/images";
import type { PhotoBg, PhotoFit } from "@/data/vehicles";

const BG: Record<PhotoBg, string> = {
  studio: "bg-[radial-gradient(120%_90%_at_50%_100%,#ece6dd_0%,#f7f4ef_55%,#ffffff_100%)]",
  white: "bg-white",
  dark: "bg-[radial-gradient(120%_90%_at_50%_100%,#3a3a42_0%,#212126_60%,#16161a_100%)]",
  brand: "bg-brand-gradient",
};

/**
 * Vehicle photo frame driven by the admin's photo settings:
 * framing (whole vehicle / fill), background and zoom. Light backgrounds
 * blend white photo backdrops away so cut-outs sit naturally on the card.
 */
export default function VehiclePhoto({
  photo,
  fit = "contain",
  bg = "studio",
  zoom = 100,
  sizes,
  priority,
  className = "",
  hover = true,
}: {
  photo: PhotoData;
  fit?: PhotoFit;
  bg?: PhotoBg;
  zoom?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  hover?: boolean;
}) {
  const light = bg === "studio" || bg === "white";
  const cover = fit === "cover";
  return (
    <div className={`relative overflow-hidden ${BG[bg]} ${className}`}>
      {/* soft ground shadow so contained vehicles do not float */}
      {!cover && <span aria-hidden className="absolute inset-x-[14%] bottom-[9%] h-[8%] rounded-[50%] bg-black/15 blur-xl" />}
      <div className={`absolute ${cover ? "inset-0" : "inset-[6%]"}`} style={!cover && zoom !== 100 ? { transform: `scale(${zoom / 100})` } : undefined}>
        <Photo
          photo={photo}
          fill
          sizes={sizes}
          priority={priority}
          className={`${cover ? "object-cover" : "object-contain"} ${light && !cover ? "mix-blend-multiply" : ""} ${hover ? "transition-transform duration-500 ease-out group-hover:scale-[1.04]" : ""}`}
        />
      </div>
    </div>
  );
}
