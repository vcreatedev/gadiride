"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, PhoneCall } from "lucide-react";
import HeroScene, { type SceneId } from "../HeroScene";
import Road from "../HeroRoad";
import HeroVehicle from "../HeroVehicle";
import BookingCard from "../BookingCard";
import CategoryIcon from "../CategoryIcon";
import WhatsAppIcon from "../WhatsAppIcon";
import { useSite } from "../SiteProvider";
import { telHref } from "@/config/site";
import { whatsappChatHref } from "@/lib/whatsapp";
import { selectTab } from "@/lib/events";
import type { ArtId } from "@/data/vehicleArt";
import type { GroupId } from "@/data/vehicles";

export type Slide = {
  group: string;
  eyebrow: string;
  title: string;
  highlight: string;
  text: string;
  points: string[];
  cta: string;
  href: string;
  scene: string;
  art: string;
  color: string;
};

const EVERY_MS = 7000;
/** Scene cross-fade length (matches the scene-in keyframe). */
const FADE_MS = 750;
const SCENES: SceneId[] = ["city", "highway", "port", "site", "street"];
const LABEL: Record<string, string> = { cars: "Cars", passenger: "Group travel", logistics: "Trucks", equipment: "JCB", driver: "Drivers", partner: "Earn with us" };
const TABS = ["cars", "passenger", "logistics", "equipment", "driver"];
const sceneOf = (v: string): SceneId => ((SCENES as string[]).includes(v) ? (v as SceneId) : "city");

/**
 * Home hero: a promotional slide per service (scene, vehicle driving in, offer points,
 * Book / WhatsApp / Call), auto-advancing with progress tabs, and the all-services
 * search card at the bottom. Pauses while hovered, focused or hidden.
 */
export default function HomeHero({ slides }: { slides: Slide[] }) {
  const site = useSite();
  const dark = site.heroTheme === "dark";
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // The slide fading out, kept mounted just long enough for the cross-fade.
  const [prev, setPrev] = useState<number | null>(null);
  const shown = useRef(0);
  const root = useRef<HTMLElement>(null);
  const s = slides[i];

  useEffect(() => {
    if (shown.current === i) return;
    setPrev(shown.current);
    shown.current = i;
    const t = window.setTimeout(() => setPrev(null), FADE_MS);
    return () => clearTimeout(t);
  }, [i]);

  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => { if (!document.hidden) setI((n) => (n + 1) % slides.length); }, EVERY_MS);
    return () => clearTimeout(id);
  }, [i, paused, slides.length]);

  const handleSelect = (n: number) => {
    setI(n);
    // Choosing a service also switches the search card to it.
    const g = slides[n].group;
    if (TABS.includes(g)) selectTab(g as GroupId | "driver");
  };

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Gadiride services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setPaused(false); }}
      className={`relative flex min-h-[100svh] flex-col overflow-hidden pb-6 pt-[84px] md:pb-8 md:pt-[92px] lg:h-[max(100svh,800px)] lg:min-h-0 ${dark ? "bg-ink-900 text-white" : "bg-[linear-gradient(180deg,#FFF4E6_0%,#FFFAF4_45%,#FFFFFF_62%)] text-ink-900"}`}
    >
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${dark ? "bg-[radial-gradient(60%_60%_at_85%_40%,rgba(244,122,22,0.16),transparent_70%)]" : "bg-[radial-gradient(55%_55%_at_80%_45%,rgba(253,176,34,0.18),transparent_70%)]"}`} />

      <div className="container-x relative grid min-h-0 flex-1 items-center gap-6 py-4 [--h:min(24svh,200px)] [--horizon:calc(var(--h)*0.45+1rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:[--h:min(30svh,280px)]">
        {/* scenes cross-fade; each sits on the horizon behind the vehicle */}
        {/* Only the current scene (and the one fading out) is in the page: each scene is hundreds of shapes. */}
        <div aria-hidden className="pointer-events-none absolute bottom-[var(--horizon)] left-1/2 h-[min(56svh,520px)] w-screen -translate-x-1/2">
          {slides.map((sl, n) =>
            n === i || n === prev ? (
              <div key={n} className={`absolute inset-0 transition-opacity duration-700 ${n === i ? "animate-[scene-in_.7s_ease-out_both]" : "opacity-0"}`}>
                <HeroScene id={sceneOf(sl.scene)} theme={site.heroTheme} />
              </div>
            ) : null,
          )}
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[calc(100%-var(--horizon))] h-[100svh] w-screen -translate-x-1/2">
          <Road theme={site.heroTheme} />
        </div>

        {/* copy: space below = --horizon so it never reaches the road */}
        <div key={`t${i}`} aria-live="polite" className="relative animate-[hero-rise_.6s_ease-out_both] lg:pb-[calc(var(--horizon)+0.5rem)] lg:pt-[min(calc(var(--horizon)+0.5rem),max(0px,calc(100svh-860px)))]">
          <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${dark ? "bg-white/10 text-brand-300" : "bg-white text-brand-700 ring-1 ring-brand-200"}`}>
            <CategoryIcon id={(TABS.includes(s.group) ? s.group : "cars") as GroupId} className="h-4 w-5" />
            {s.eyebrow}
          </p>
          <h1 className={`display mt-4 text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-[clamp(3rem,4.8vw,4.6rem)] ${dark ? "text-white" : "text-ink-900"}`}>
            {s.title} <span className="text-gradient block">{s.highlight}</span>
          </h1>
          <p className={`lead mt-4 max-w-[48ch] ${dark ? "text-ink-300" : "text-ink-600"}`}>{s.text}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {s.points.map((p) => (
              <li key={p} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${dark ? "text-white/90" : "text-ink-800"}`}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-gradient text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link href={s.href} className="btn-primary h-12 rounded-full px-6 text-[15px]">
              {s.cta}<ArrowRight className="h-4 w-4" />
            </Link>
            <a href={whatsappChatHref(site.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-whatsapp px-5 text-[15px] font-semibold text-white transition hover:bg-whatsapp-dark">
              <WhatsAppIcon className="h-5 w-5" />WhatsApp
            </a>
            {site.phone && (
              <a href={telHref(site.phone)} className={`inline-flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-semibold ring-1 transition ${dark ? "text-white ring-white/25 hover:bg-white/10" : "bg-white text-ink-900 ring-line hover:ring-brand-400"}`}>
                <PhoneCall className="h-4 w-4 text-brand-500" />{site.phone.replace(/^\+91\s*/, "")}
              </a>
            )}
          </div>
          {/* slide dots: the active one fills up until the next slide */}
          <div role="tablist" aria-label="Choose a service" className="mt-6 flex items-center gap-2">
            {slides.map((sl, n) => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={LABEL[sl.group] ?? sl.group}
                title={LABEL[sl.group] ?? sl.group}
                onClick={() => handleSelect(n)}
                className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${n === i ? "w-10" : `w-2.5 ${dark ? "bg-white/25 hover:bg-white/50" : "bg-ink-900/15 hover:bg-ink-900/35"}`}`}
              >
                {n === i && (
                  <>
                    <span aria-hidden className={`absolute inset-0 ${dark ? "bg-white/25" : "bg-ink-900/15"}`} />
                    <span key={`p${i}${paused}`} aria-hidden className={`absolute inset-0 origin-left bg-brand-gradient ${paused ? "" : "animate-[slide-progress_7s_linear_forwards]"}`} />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* the vehicle drives in on every slide */}
        <div aria-hidden className="pointer-events-none relative flex justify-center self-end lg:justify-end">
          <HeroVehicle key={`v${i}`} art={s.art as ArtId} color={s.color} driver={s.group === "driver"} />
        </div>
      </div>

      <div className="container-x relative">
        <BookingCard onServiceChange={(t) => { const n = slides.findIndex((sl) => sl.group === t); if (n >= 0) setI(n); }} />
      </div>
    </section>
  );
}
