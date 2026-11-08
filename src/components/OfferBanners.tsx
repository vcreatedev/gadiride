"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import VehicleSvg from "./VehicleSvg";
import WhatsAppIcon from "./WhatsAppIcon";
import { useSite } from "./SiteProvider";
import { telHref, type Banner, type BannerTone } from "@/config/site";
import { whatsappChatHref } from "@/lib/whatsapp";

const TONE: Record<BannerTone, { card: string; title: string; eyebrow: string; text: string; btn: string; glow: string }> = {
  brand: { card: "bg-brand-gradient text-white", title: "text-white", eyebrow: "bg-white/20 text-white", text: "text-white/85", btn: "bg-white text-ink-900 hover:bg-ink-900 hover:text-white", glow: "bg-white/25" },
  dark: { card: "bg-ink-900 text-white ring-1 ring-white/10", title: "text-white", eyebrow: "bg-brand-500/20 text-brand-300", text: "text-ink-300", btn: "bg-brand-gradient text-white hover:brightness-110", glow: "bg-brand-500/20" },
  taxi: { card: "bg-taxi text-ink-900", title: "text-ink-900", eyebrow: "bg-ink-900 text-taxi", text: "text-ink-800", btn: "bg-ink-900 text-white hover:bg-ink-700", glow: "bg-white/50" },
  light: { card: "bg-white text-ink-900 ring-1 ring-line", title: "text-ink-900", eyebrow: "bg-brand-50 text-brand-700", text: "text-ink-600", btn: "bg-ink-900 text-white hover:bg-brand-600", glow: "bg-brand-200/60" },
};

const EVERY_MS = 5000;

/** Offer banners as a swipeable slider that advances on its own (pauses on hover, focus or touch). */
export default function OfferBanners({ banners, title }: { banners: Banner[]; title?: string }) {
  const site = useSite();
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-banner]");
    const by = card ? card.offsetWidth + 20 : el.clientWidth;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    el.scrollTo({ left: dir > 0 && end ? 0 : el.scrollLeft + dir * by, behavior: "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      setAtStart(el.scrollLeft < 8);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => el.removeEventListener("scroll", onScroll);
    const id = window.setInterval(() => { if (!paused.current && !document.hidden) step(1); }, EVERY_MS);
    return () => { clearInterval(id); el.removeEventListener("scroll", onScroll); };
  }, []);

  if (!banners.length) return null;

  const action = (b: Banner) => {
    const cls = `mt-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all ${TONE[b.tone].btn}`;
    if (b.href === "tel" && site.phone)
      return <a href={telHref(site.phone)} className={cls}><Phone className="h-4 w-4" />{b.cta}</a>;
    if (b.href === "whatsapp" || (b.href === "tel" && !site.phone))
      return <a href={whatsappChatHref(site.whatsappNumber)} target="_blank" rel="noopener noreferrer" className={cls}><WhatsAppIcon className="h-4 w-4" />{b.cta}</a>;
    return <Link href={b.href || "/vehicles/cars/#all"} className={cls}>{b.cta}<ArrowRight className="h-4 w-4" /></Link>;
  };

  return (
    <div
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        {title && <h2 className="h2">{title}</h2>}
        {/* Arrows only when there is more than one offer to move between. */}
        <div className={`ml-auto hidden gap-2 ${banners.length > 1 ? "sm:flex" : ""}`}>
          <button type="button" onClick={() => step(-1)} disabled={atStart} aria-label="Previous offer" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-900 ring-1 ring-line transition-colors hover:bg-ink-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-ink-900">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label={atEnd ? "Back to first offer" : "Next offer"} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-900 ring-1 ring-line transition-colors hover:bg-ink-900 hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={track} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0" role="region" aria-roledescription="carousel" aria-label="Offers">
        {banners.map((b, i) => {
          // Brand colours only (orange, dark, yellow); anything else, e.g. an old "light" banner, takes the next one in turn.
          const tone: BannerTone = b.tone === "brand" || b.tone === "dark" || b.tone === "taxi" ? b.tone : (["brand", "dark", "taxi"] as const)[i % 3];
          const t = TONE[tone];
          return (
            <article
              key={`${b.title}-${i}`}
              data-banner
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${banners.length}`}
              className={`relative flex min-h-[270px] w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-card p-6 md:w-[calc((100%-1.25rem)/2)] md:p-7 lg:w-[calc((100%-2.5rem)/3)] ${t.card}`}
            >
              <span aria-hidden className={`pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full blur-3xl ${t.glow}`} />
              <div className="relative">
                {b.eyebrow && <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${t.eyebrow}`}>{b.eyebrow}</span>}
                <h3 className={`mt-3 font-head text-[1.7rem] font-semibold leading-[1.1] md:text-[1.9rem] ${t.title}`}>{b.title}</h3>
                {b.text && <p className={`mt-2 text-[15px] leading-relaxed ${t.text}`}>{b.text}</p>}
              </div>
              <div className="relative mt-auto">{b.cta && action(b)}</div>
              {/* a short road along the bottom; the vehicle sits fully inside the card, clear of the button */}
              <div aria-hidden className="relative -mx-6 -mb-6 mt-4 h-[68px] md:-mx-7 md:-mb-7">
                <div className="absolute inset-x-0 bottom-[14px] border-t-2 border-dashed border-current opacity-25" />
                <VehicleSvg art={b.art} color={b.color} className="absolute bottom-[12px] right-6 w-[132px] drop-shadow-[0_8px_10px_rgba(0,0,0,0.28)] md:right-7" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
