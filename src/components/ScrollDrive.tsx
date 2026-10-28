"use client";
import { useRef } from "react";
import VehicleRig, { type RigHandle } from "./VehicleRig";
import type { ArtId } from "@/data/vehicleArt";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { bindWheels } from "@/lib/drive";

/** A vehicle crosses a thin road strip, tied to scroll position. Used as a section divider. */
export default function ScrollDrive({ art, color, width = "clamp(160px,22vw,300px)", tone = "light" }: { art: ArtId; color: string; width?: string; tone?: "light" | "dark" }) {
  const root = useRef<HTMLDivElement>(null);
  const rig = useRef<RigHandle>(null);
  useGSAP(() => {
    if (!rig.current || prefersReducedMotion()) return;
    const b = bindWheels(rig.current);
    gsap.fromTo(rig.current.root,
      { x: () => -rig.current!.root.offsetWidth - 40 },
      { x: () => window.innerWidth + 40, ease: "none", onUpdate: b.update,
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
  }, { scope: root });
  return (
    <div ref={root} aria-hidden className={`relative h-[clamp(90px,12vw,150px)] overflow-hidden ${tone === "dark" ? "bg-ink-900" : "bg-white"}`}>
      <div className={`absolute inset-x-0 bottom-3 h-[2px] ${tone === "dark" ? "bg-white/10" : "bg-surface-100"}`} />
      <div className="absolute bottom-3 left-0">
        <VehicleRig ref={rig} art={art} color={color} width={width} speedLines={tone === "dark"} shadow={tone === "dark" ? "dark" : "light"} />
      </div>
    </div>
  );
}
