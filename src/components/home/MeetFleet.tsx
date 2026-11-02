"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TYPES } from "@/data/vehicles";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import SectionTitle from "../SectionTitle";

const ORDER = ["hatchback", "sedan", "suv", "luxury", "pickup", "tempo", "truck", "jcb", "bus"];

export default function MeetFleet() {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const list = [...ORDER].reverse().map((id) => TYPES.find((t) => t.id === id)!);

  useGSAP(() => {
    if (!row.current || prefersReducedMotion()) return;
    gsap.fromTo(
      row.current,
      { x: () => window.innerWidth * 0.6 - row.current!.scrollWidth },
      {
        x: () => window.innerWidth * 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      }
    );
  }, { scope: root });

  return (
    <section ref={root} className="section-y overflow-hidden bg-white" aria-labelledby="fleet-title">
      <div className="container-x text-center">
        <SectionTitle id="fleet-title">
          Meet the fleet<span className="text-brand-500">.</span>
        </SectionTitle>
        <p className="lead mx-auto mt-4">From a city hatchback to luxury coaches and heavy machines.</p>
      </div>
      <div className="relative mt-14">
        <div aria-hidden className="absolute inset-x-0 bottom-[38px] h-[3px] bg-surface-100" />
        <div ref={row} className="flex w-max items-end gap-[clamp(28px,4vw,64px)] px-6 will-change-transform">
          {list.map((t) => (
            <div key={t.id} className="flex flex-col items-center">
              <div className="flex h-[130px] w-[210px] items-end justify-center md:h-[160px] md:w-[260px]">
                <img
                  src={`/vehicles/${t.id}.webp`}
                  alt={t.name}
                  className="h-full w-full object-contain mix-blend-multiply drop-shadow-sm"
                  loading="lazy"
                />
              </div>
              <span className="mt-5 text-sm font-semibold text-ink-900">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex items-center justify-center gap-4">
        <ArrowLeft aria-hidden className="h-5 w-5 text-ink-400" />
        <Link href="/vehicles/" className="btn-primary">
          View all vehicles
        </Link>
        <ArrowRight aria-hidden className="h-5 w-5 text-ink-400" />
      </div>
    </section>
  );
}
