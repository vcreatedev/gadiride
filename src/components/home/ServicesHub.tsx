"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import VehicleSvg from "../VehicleSvg";
import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";
import type { ArtId } from "@/data/vehicleArt";

type Item = { title: string; text: string; tag: string; href: string; art: string; color: string };

/** Card colours cycle through the logo palette: orange, dark, yellow. */
const TONES = [
  { card: "bg-brand-gradient text-white", title: "text-white", text: "text-white/85", tag: "bg-white/20 text-white", arrow: "bg-white text-ink-900" },
  { card: "bg-ink-900 text-white", title: "text-white", text: "text-ink-300", tag: "bg-brand-500/20 text-brand-300", arrow: "bg-brand-gradient text-white" },
  { card: "bg-taxi text-ink-900", title: "text-ink-900", text: "text-ink-800", tag: "bg-ink-900 text-taxi", arrow: "bg-ink-900 text-white" },
];

const EVERY_MS = 5000;
/** Below Tailwind's `sm` breakpoint the grid becomes a swipe carousel. */
const PHONE = "(max-width: 639px)";

/**
 * Every service at a glance. Tablet and up: a bento grid with a big card for cars.
 * Phones: the same cards as a swipeable carousel (like the offers) that advances on its own.
 */
export default function ServicesHub({ content }: { content: { title: string; text: string; items: Item[] } }) {
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  const [active, setActive] = useState(0);
  const count = content.items.length;

  const goTo = (n: number) => {
    const el = track.current;
    const card = el?.children[n] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;
      setActive(Math.min(count - 1, Math.round(el.scrollLeft / (first.offsetWidth + 16))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const phone = window.matchMedia(PHONE);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setInterval(() => {
      if (calm || !phone.matches || paused.current || document.hidden) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else {
        const first = el.children[0] as HTMLElement | undefined;
        el.scrollBy({ left: first ? first.offsetWidth + 16 : el.clientWidth, behavior: "smooth" });
      }
    }, EVERY_MS);
    return () => { clearInterval(id); el.removeEventListener("scroll", onScroll); };
  }, [count]);

  if (!count) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="hub-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle id="hub-title">{accent(content.title)}</SectionTitle>
          {content.text && <p className="max-w-[46ch] text-ink-600">{content.text}</p>}
        </div>
        <ul
          ref={track}
          onTouchStart={() => (paused.current = true)}
          onFocusCapture={() => (paused.current = true)}
          onBlurCapture={() => (paused.current = false)}
          aria-roledescription="carousel"
          className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
        >
          {content.items.map((it, n) => {
            const t = TONES[n % TONES.length];
            const big = n === 0;
            return (
              <li key={it.title} className={`w-[86%] shrink-0 snap-start sm:w-auto ${big ? "sm:col-span-2 lg:row-span-2" : ""}`}>
                <Link
                  href={it.href}
                  className={`group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-card p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7 ${big ? "sm:min-h-[300px]" : "sm:min-h-[230px]"} ${t.card}`}
                >
                  <span className={`self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${t.tag}`}>{it.tag}</span>
                  <h3 className={`mt-3 font-head text-2xl font-semibold leading-tight ${big ? "sm:text-3xl md:text-4xl" : ""} ${t.title}`}>{it.title}</h3>
                  <p className={`mt-2 max-w-[34ch] text-[15px] ${t.text}`}>{it.text}</p>
                  <div className="relative mt-auto flex items-end justify-between pt-6">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-110 ${t.arrow}`} aria-hidden>
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                    <VehicleSvg
                      art={it.art as ArtId}
                      color={it.color}
                      className={`pointer-events-none w-[52%] max-w-[190px] drop-shadow-[0_10px_12px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:-translate-x-2 ${big ? "sm:w-[62%] sm:max-w-[420px]" : ""}`}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {/* phone only: which card is showing; tap a dot to jump */}
        <div className="mt-5 flex justify-center gap-2 sm:hidden">
          {content.items.map((it, n) => (
            <button
              key={it.title}
              type="button"
              aria-label={`Show ${it.title}`}
              aria-current={n === active}
              onClick={() => { paused.current = true; goTo(n); }}
              className={`h-2.5 rounded-full transition-all duration-300 ${n === active ? "w-8 bg-brand-gradient" : "w-2.5 bg-ink-900/15"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
