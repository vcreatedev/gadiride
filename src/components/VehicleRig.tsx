"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import VehicleSvg from "./VehicleSvg";
import { ART, type ArtId } from "@/data/vehicleArt";

export type RigHandle = {
  root: HTMLDivElement;
  body: Element;
  wheels: Element[];
  spokes: Element[];
  blurs: Element[];
  shadow: HTMLDivElement;
  arms: Record<string, Element>;
  lines: HTMLDivElement | null;
  art: ArtId;
  /** Wheel radius in CSS pixels at the current rendered size. */
  wheelRadiusPx: () => number;
};

type Props = {
  art: ArtId;
  color?: string;
  /** Rendered width. Use true-scale widths for fleet lineups. */
  width?: string;
  className?: string;
  title?: string;
  speedLines?: boolean;
  shadow?: "light" | "dark";
};

const VehicleRig = forwardRef<RigHandle, Props>(function VehicleRig(
  { art, color, width = "100%", className = "", title, speedLines = false, shadow = "light" },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const a = ART[art];
  const [, minY, w, h] = a.viewBox;
  const groundFromBottom = ((minY + h - a.groundY) / h) * 100;

  useImperativeHandle(ref, () => {
    const el = root.current!;
    const q = <T extends Element>(s: string) => Array.from(el.querySelectorAll<T>(s));
    const arms: Record<string, Element> = {};
    q("[data-arm]").forEach((g) => (arms[g.getAttribute("data-arm")!] = g));
    return {
      root: el,
      body: el.querySelector("[data-rig=body]")!,
      wheels: q("[data-rig=wheel]"),
      spokes: q("[data-rig=spokes]"),
      blurs: q("[data-rig=blur]"),
      shadow: shadowRef.current!,
      arms,
      lines: linesRef.current,
      art,
      wheelRadiusPx: () => (el.getBoundingClientRect().width / w) * a.wheels[0].r,
    };
  }, [art, w, a]);

  return (
    <div ref={root} className={`relative will-change-transform ${className}`} style={{ width, aspectRatio: `${w} / ${h}` }}>
      {speedLines && (
        <div ref={linesRef} aria-hidden className="pointer-events-none absolute inset-y-[25%] -left-[45%] w-[55%] opacity-0">
          {[18, 42, 64, 82].map((t, i) => (
            <span key={t} className="absolute right-0 h-[2px] rounded-full bg-gradient-to-l from-white/70 to-transparent" style={{ top: `${t}%`, width: `${60 + i * 12}%` }} />
          ))}
        </div>
      )}
      <div
        ref={shadowRef}
        aria-hidden
        className="pointer-events-none absolute left-[4%] right-[4%] h-[9%] origin-center rounded-[50%]"
        style={{
          bottom: `calc(${groundFromBottom}% - 4.5%)`,
          background: shadow === "dark" ? "radial-gradient(closest-side, rgba(0,0,0,.75), rgba(0,0,0,0))" : "radial-gradient(closest-side, rgba(17,18,20,.35), rgba(17,18,20,0))",
        }}
      />
      <VehicleSvg art={art} color={color} title={title} className="absolute inset-0 h-full w-full" />
    </div>
  );
});

export default VehicleRig;
