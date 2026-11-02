"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TYPES } from "@/data/vehicles";
import SectionTitle from "../SectionTitle";

/** Browse by vehicle style with realistic photography. */
export default function StyleRail() {
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (d: number) =>
    rail.current?.scrollBy({ left: d * (rail.current.clientWidth || 300) * 0.8, behavior: "smooth" });

  return (
    <section className="section-y bg-white" aria-labelledby="styles-title">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle id="styles-title">
            Pick a style<span className="text-brand-500">.</span>
          </SectionTitle>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Scroll styles left"
              onClick={() => scroll(-1)}
              className="grid h-12 w-12 place-items-center rounded-full border border-ink-900 text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Scroll styles right"
              onClick={() => scroll(1)}
              className="grid h-12 w-12 place-items-center rounded-full border border-ink-900 text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <ul
        ref={rail}
        data-lenis-prevent
        className="no-scrollbar container-x mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {TYPES.map((t) => (
          <li key={t.id} className="snap-start">
            <Link
              href={`/vehicles/${t.group}/#${t.id}`}
              className="group flex h-full w-[200px] flex-col items-center rounded-card border border-line/70 bg-surface-50/60 px-4 pb-5 pt-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:bg-white hover:shadow-card sm:w-[230px]"
            >
              <span className="font-head text-base font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                {t.name}
              </span>
              <div className="mt-4 flex h-[100px] w-full items-center justify-center overflow-hidden">
                <img
                  src={`/vehicles/${t.id}.webp`}
                  alt={t.name}
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
