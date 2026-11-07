import { Star } from "lucide-react";
import SectionTitle from "../SectionTitle";
import Photo from "../Photo";
import { accent } from "../Accent";
import type { Testimonial } from "@/lib/content";

/** Enough cards in one loop to fill a wide screen, so the strip never shows a gap. */
const MIN_CARDS = 6;
/** Seconds each card takes to pass, so the speed stays the same however many reviews there are. */
const SECONDS_PER_CARD = 9;

function Card({ t }: { t: Testimonial }) {
  return (
    <>
      <div className="flex gap-0.5 text-taxi" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-current" : "opacity-25"}`} />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-700">“{t.quote}”</blockquote>
      <div className="mt-6 flex items-center gap-3">
        {t.photo ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Photo photo={t.photo} fill sizes="40px" className="object-cover" />
          </div>
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient font-head font-semibold text-white">{t.name.charAt(0)}</span>
        )}
        <div>
          <p className="font-semibold text-ink-900">{t.name}</p>
          {t.detail && <p className="text-xs text-ink-400">{t.detail}</p>}
        </div>
      </div>
    </>
  );
}

/**
 * Real customer reviews from the admin, scrolling right to left in an endless loop (pure CSS, like
 * the offers strip). Pauses on hover or focus; still for visitors who prefer reduced motion.
 * Hidden when there are none.
 */
export default function Testimonials({ title, items }: { title: string; items: Testimonial[] }) {
  if (!items.length) return null;
  // One loop holds every review (repeated if there are few); it is rendered twice and slides by half.
  const loop = Array.from({ length: Math.ceil(MIN_CARDS / items.length) }, () => items).flat();
  const duration = `${loop.length * SECONDS_PER_CARD}s`;
  const row = (copy: number) => (
    <ul aria-hidden={copy > 0 || undefined} className="flex shrink-0 gap-4 pr-4">
      {loop.map((t, i) => (
        <li key={`${copy}-${i}`} aria-hidden={(copy === 0 && i >= items.length) || undefined} className="flex w-[300px] shrink-0 flex-col rounded-card bg-white p-7 shadow-card sm:w-[360px]">
          <Card t={t} />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="section-y bg-surface-50" aria-labelledby="reviews-title">
      <div className="container-x">
        <SectionTitle id="reviews-title">{accent(title)}</SectionTitle>
      </div>
      <div className="reviews-marquee mt-10 overflow-hidden py-3">
        <div className="reviews-track flex w-max" style={{ "--reviews-duration": duration } as React.CSSProperties}>
          {row(0)}
          {row(1)}
        </div>
      </div>
    </section>
  );
}
