"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import SectionTitle from "../SectionTitle";
import Photo from "../Photo";
import { useCatalog } from "../SiteProvider";
import { accent } from "../Accent";
import type { HomeContent } from "@/content/defaults";

/** Small to large reads best as a convoy. Unknown (admin-added) types go at the end. */
const ORDER = ["hatchback", "sedan", "suv", "luxury", "pickup", "tempo", "truck", "jcb", "bus"];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);

export default function MeetFleet({ content: c }: { content: HomeContent["fleet"] }) {
  const { types } = useCatalog();
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const list = [...types].sort((a, b) => rank(a.id) - rank(b.id)).reverse();

  useGSAP(() => {
    if (!row.current || prefersReducedMotion()) return;
    gsap.fromTo(
      row.current,
      { x: () => window.innerWidth * 0.6 - row.current!.scrollWidth },
      {
        x: () => window.innerWidth * 0.08,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
      },
    );
  }, { scope: root });

  return (
    <section ref={root} className="section-y overflow-hidden bg-white" aria-labelledby="fleet-title">
      <div className="container-x text-center">
        <SectionTitle id="fleet-title">{accent(c.title)}</SectionTitle>
        <p className="lead mx-auto mt-4">{c.text}</p>
      </div>
      <div className="relative mt-14">
        <div aria-hidden className="absolute inset-x-0 bottom-[38px] h-[3px] bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
        <div ref={row} className="flex w-max items-end gap-[clamp(28px,4vw,64px)] px-6 will-change-transform">
          {list.map((t) => (
            <Link key={t.id} href={`/vehicles/${t.group}/?type=${t.id}`} className="group flex flex-col items-center">
              <div className="relative h-[130px] w-[210px] overflow-hidden rounded-2xl shadow-card md:h-[160px] md:w-[260px]">
                <Photo photo={t.photo} alt={t.name} fill sizes="260px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <span className="mt-5 text-sm font-semibold text-ink-900 group-hover:text-brand-600">{t.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-12 flex items-center justify-center gap-4">
        <ArrowLeft aria-hidden className="h-5 w-5 text-ink-400" />
        <Link href="/vehicles/" className="btn-primary">{c.cta}</Link>
        <ArrowRight aria-hidden className="h-5 w-5 text-ink-400" />
      </div>
    </section>
  );
}
