"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TYPES } from "@/data/vehicles";
import VehicleRig, { type RigHandle } from "../VehicleRig";
import { drive } from "@/lib/drive";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import SectionTitle from "../SectionTitle";

/** Browse by vehicle style. Hovering rolls the vehicle forward with matching wheel rotation. */
export default function StyleRail() {
  const rail = useRef<HTMLUListElement>(null);
  const rigs = useRef<Record<string, RigHandle | null>>({});
  const roll = (id: string, to: number) => {
    const r = rigs.current[id];
    if (!r || prefersReducedMotion()) return;
    gsap.killTweensOf(r.root);
    const from = gsap.getProperty(r.root, "x") as number;
    drive(r, { from, to, duration: 0.7, kind: "enter", blur: false });
  };
  const scroll = (d: number) => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="section-y bg-white" aria-labelledby="styles-title">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <SectionTitle id="styles-title">Pick a style<span className="text-brand-500">.</span></SectionTitle>
          <div className="hidden gap-2 sm:flex">
            <button type="button" aria-label="Scroll styles left" onClick={() => scroll(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Scroll styles right" onClick={() => scroll(1)} className="grid h-12 w-12 place-items-center rounded-full border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white"><ArrowRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
      <ul ref={rail} data-lenis-prevent className="no-scrollbar container-x mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {TYPES.map((t) => (
          <li key={t.id} className="snap-start">
            <Link
              href={`/vehicles/${t.group}/#${t.id}`}
              onMouseEnter={() => roll(t.id, 14)}
              onMouseLeave={() => roll(t.id, 0)}
              onFocus={() => roll(t.id, 14)}
              onBlur={() => roll(t.id, 0)}
              className="flex h-full w-[200px] flex-col items-center rounded-card px-4 pb-5 pt-6 transition-colors hover:bg-surface-50 sm:w-[230px]"
            >
              <span className="font-head text-base font-bold text-ink-900">{t.name}</span>
              <div className="mt-6 flex h-[96px] w-full items-end justify-center">
                <VehicleRig ref={(el) => { rigs.current[t.id] = el; }} art={t.art} color={t.color} width={t.art === "bus" ? "100%" : t.art === "truck" ? "92%" : "82%"} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
