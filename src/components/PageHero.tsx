import type { ArtId } from "@/data/vehicleArt";
import HeroVehicle from "./HeroVehicle";
import HeroCarousel from "./HeroCarousel";
import type { HeroVariant } from "@/data/vehicles";
import HeroScene, { type HeroTheme, type SceneId } from "./HeroScene";
import { getSettings } from "@/lib/content";
import Road from "./HeroRoad";
import Photo from "./Photo";
import type { Photo as PhotoData } from "@/lib/images";

type Props = {
  title: React.ReactNode;
  intro?: string;
  art?: ArtId;
  color?: string;
  children?: React.ReactNode;
  /** Full-screen hero with a slot (e.g. the search bar) pinned to the bottom. */
  full?: boolean;
  bottom?: React.ReactNode;
  /** Show a chauffeur stepping out of the vehicle once it stops. */
  driver?: boolean;
  /** Vehicles that take turns in the full hero (every 30s). Defaults to art/color. */
  variants?: HeroVariant[];
  /** Illustrated background banner for the full hero. */
  scene?: SceneId;
  /** Background photo from the admin; replaces the illustrated scene. */
  bgPhoto?: PhotoData;
};

/** Header for inner pages, light or dark per the "Hero style" setting. `full` fills the screen with the search bar at the bottom. */
export default async function PageHero({ title, intro, art, color = "#C9CDD3", children, full = false, bottom, driver = false, variants, scene, bgPhoto }: Props) {
  const { heroTheme: theme } = await getSettings();
  const dark = theme === "dark";
  const titleCls = dark ? "text-white" : "text-ink-900";
  const introCls = dark ? "text-ink-300" : "text-ink-600";
  if (full) {
    return (
      <section className={`relative flex min-h-[100svh] flex-col overflow-hidden pb-6 lg:h-[max(100svh,720px)] lg:min-h-0 pt-[88px] md:pb-10 md:pt-[96px] ${dark ? "bg-ink-900 text-white" : "bg-[linear-gradient(180deg,#FFF4E6_0%,#FFFAF4_45%,#FFFFFF_62%)] text-ink-900"}`}>
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${dark ? "bg-[radial-gradient(60%_60%_at_85%_40%,rgba(244,122,22,0.16),transparent_70%)]" : "bg-[radial-gradient(55%_55%_at_80%_45%,rgba(253,176,34,0.18),transparent_70%)]"}`} />
        {/*
          The horizon (where the road begins) is measured up from the vehicle, not from the screen:
          --h is the vehicle height and --horizon sits just behind its wheels. The scene and road are
          anchored to it, and the text keeps that much space below itself, so they never overlap.
        */}
        <div className="container-x relative grid min-h-0 flex-1 items-center gap-6 py-6 [--h:min(26svh,220px)] [--horizon:calc(var(--h)*0.45+1.5rem)] lg:grid-cols-[1fr_1fr] lg:gap-8 lg:[--h:min(36svh,320px)]">
          {bgPhoto ? (
            <div aria-hidden className="pointer-events-none absolute bottom-[var(--horizon)] left-1/2 h-[100svh] w-screen -translate-x-1/2">
              <Photo photo={bgPhoto} alt="" fill priority sizes="100vw" className="object-cover" />
              <div className={`absolute inset-0 ${dark ? "bg-[linear-gradient(90deg,rgba(14,15,17,0.94)_0%,rgba(14,15,17,0.7)_45%,rgba(14,15,17,0.35)_100%)]" : "bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.75)_45%,rgba(255,255,255,0.15)_100%)]"}`} />
            </div>
          ) : (
            scene && (
              <div aria-hidden className="pointer-events-none absolute bottom-[var(--horizon)] left-1/2 h-[min(56svh,520px)] w-screen -translate-x-1/2">
                <HeroScene id={scene} theme={theme} />
              </div>
            )
          )}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[calc(100%-var(--horizon))] h-[100svh] w-screen -translate-x-1/2">
            <Road theme={theme} />
          </div>
          {/*
            Space below = --horizon, so the text never reaches the road. Space above matches it on tall
            screens (text stays centred as before) and shrinks on short ones so the search bar stays in view.
          */}
          <div className="relative animate-[hero-rise_.7s_ease-out_both] lg:pb-[calc(var(--horizon)+0.5rem)] lg:pt-[min(calc(var(--horizon)+0.5rem),max(0px,calc(100svh-760px)))]">
            <h1 className={`display text-5xl sm:text-6xl lg:text-[clamp(3.5rem,6vw,5.5rem)] ${titleCls}`}>{title}</h1>
            {intro && <p className={`lead mt-5 max-w-[46ch] ${introCls}`}>{intro}</p>}
            {children}
          </div>
          {art && (
            <div aria-hidden className="pointer-events-none relative flex justify-center self-end lg:justify-end">
              <HeroCarousel variants={variants?.length ? variants : [{ art, color }]} driver={driver} />
            </div>
          )}
        </div>
        {bottom && <div className="container-x relative">{bottom}</div>}
      </section>
    );
  }
  return (
    <section className={`relative overflow-hidden pt-28 md:pt-40 ${art ? "pb-40 md:pb-36 lg:pb-28" : "pb-24 md:pb-28"} ${dark ? "bg-ink-900 text-white" : "bg-[linear-gradient(180deg,#FFF4E6_0%,#FFFFFF_80%)] text-ink-900"}`}>
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${dark ? "bg-[radial-gradient(50%_70%_at_85%_30%,rgba(244,122,22,0.14),transparent_70%)]" : "bg-[radial-gradient(50%_70%_at_85%_30%,rgba(253,176,34,0.16),transparent_70%)]"}`} />
      <Road theme={theme} compact />
      {art && (
        <div aria-hidden className="pointer-events-none absolute bottom-[30px] right-4 w-[62%] max-w-[300px] opacity-95 md:right-[6%] md:w-[34%] md:max-w-[440px]">
          {/* drives in and parks; a large --h lets it fill this box, so its size is set by the box width */}
          <div className="[--h:999px]">
            <HeroVehicle art={art} color={color} />
          </div>
        </div>
      )}
      <div className="container-x relative">
        <h1 className={`display max-w-[14ch] text-5xl sm:text-6xl lg:text-7xl ${titleCls}`}>{title}</h1>
        {intro && <p className={`lead mt-5 max-w-[52ch] ${introCls}`}>{intro}</p>}
        {children}
      </div>
    </section>
  );
}
