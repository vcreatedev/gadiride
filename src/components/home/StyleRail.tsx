"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SectionTitle from "../SectionTitle";
import Photo from "../Photo";
import { useCatalog } from "../SiteProvider";
import { accent } from "../Accent";

/** Browse by vehicle style. Types and photos come from the admin. */
export default function StyleRail({ title }: { title: string }) {
  const { types } = useCatalog();
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (d: number) => rail.current?.scrollBy({ left: d * (rail.current.clientWidth || 300) * 0.8, behavior: "smooth" });
  if (!types.length) return null;

  return (
    <section className="section-y bg-white" aria-labelledby="styles-title">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle id="styles-title">{accent(title)}</SectionTitle>
          <div className="hidden gap-2 sm:flex">
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d < 0 ? "Scroll styles left" : "Scroll styles right"}
                onClick={() => scroll(d)}
                className="grid h-12 w-12 place-items-center rounded-full border border-ink-900 text-ink-900 transition-colors hover:border-brand-500 hover:bg-brand-500 hover:text-white"
              >
                {d < 0 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ul ref={rail} data-lenis-prevent className="no-scrollbar container-x mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {types.map((t) => (
          <li key={t.id} className="snap-start">
            <Link
              href={`/vehicles/${t.group}/?type=${t.id}`}
              className="group flex h-full w-[200px] flex-col items-center rounded-card border border-line/70 bg-gradient-to-b from-white to-[#f6f2ec] px-4 pb-5 pt-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card sm:w-[230px]"
            >
              <span className="font-head text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-600">{t.name}</span>
              <div className="relative mt-4 h-[110px] w-full overflow-hidden rounded-2xl">
                <Photo
                  photo={t.photo}
                  alt={t.name}
                  fill
                  sizes="230px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
