"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import VehicleRig, { type RigHandle } from "../VehicleRig";
import { ART } from "@/data/vehicleArt";
import { TYPES } from "@/data/vehicles";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { bindWheels } from "@/lib/drive";
import SectionTitle from "../SectionTitle";

const ORDER = ["hatchback", "sedan", "suv", "luxury", "pickup", "tempo", "truck", "jcb", "bus"];

/**
 * True-scale convoy. Every vehicle is drawn at the same centimetres-to-pixels ratio,
 * so the jump from hatchback to bus shows the range at a glance. The convoy drives as you scroll.
 */
export default function MeetFleet() {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const rigs = useRef<(RigHandle | null)[]>([]);
  // Largest at the back of the convoy, smallest leading on the right (vehicles face right).
  const list = [...ORDER].reverse().map((id) => TYPES.find((t) => t.id === id)!);

  useGSAP(() => {
    if (!row.current || prefersReducedMotion()) return;
    const binds = rigs.current.filter(Boolean).map((r) => bindWheels(r!, { source: row.current!, blur: false }));
    gsap.fromTo(row.current,
      { x: () => window.innerWidth * 0.6 - row.current!.scrollWidth },
      {
        x: () => window.innerWidth * 0.08,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
        onUpdate: () => binds.forEach((b) => b.update()),
      });
  }, { scope: root });

  return (
    <section ref={root} className="section-y overflow-hidden bg-white" aria-labelledby="fleet-title">
      <div className="container-x text-center">
        <SectionTitle id="fleet-title">Meet the fleet<span className="text-brand-500">.</span></SectionTitle>
        <p className="lead mx-auto mt-4">Shown to scale, from a city hatchback to a 40-seat coach.</p>
      </div>
      <div className="relative mt-14">
        <div aria-hidden className="absolute inset-x-0 bottom-[38px] h-[3px] bg-surface-100" />
        <div ref={row} className="flex w-max items-end gap-[clamp(28px,4vw,64px)] px-6 will-change-transform">
          {list.map((t, i) => (
            <div key={t.id} className="flex flex-col items-center">
              <VehicleRig ref={(el) => { rigs.current[i] = el; }} art={t.art} color={t.color} width={`calc(${ART[t.art].viewBox[2]}px * var(--fleet-scale))`} title={t.name} />
              <span className="mt-5 text-sm font-semibold text-ink-900">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex items-center justify-center gap-4">
        <ArrowLeft aria-hidden className="h-5 w-5 text-ink-400" />
        <Link href="/vehicles/" className="btn-primary">View all vehicles</Link>
        <ArrowRight aria-hidden className="h-5 w-5 text-ink-400" />
      </div>
      <style>{`:root{--fleet-scale:.24} @media(min-width:768px){:root{--fleet-scale:.32}} @media(min-width:1280px){:root{--fleet-scale:.38}}`}</style>
    </section>
  );
}
