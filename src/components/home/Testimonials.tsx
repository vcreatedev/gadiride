import { Star } from "lucide-react";
import SectionTitle from "../SectionTitle";
import Photo from "../Photo";
import { accent } from "../Accent";
import type { Testimonial } from "@/lib/content";

/** Real customer reviews from the admin. Hidden when there are none. */
export default function Testimonials({ title, items }: { title: string; items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="section-y bg-surface-50" aria-labelledby="reviews-title">
      <div className="container-x">
        <SectionTitle id="reviews-title">{accent(title)}</SectionTitle>
        <ul data-lenis-prevent className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
          {items.map((t) => (
            <li key={t.name + t.quote.slice(0, 12)} className="flex w-[84vw] shrink-0 snap-start flex-col rounded-card bg-white p-7 shadow-card sm:w-[360px] md:w-auto">
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
