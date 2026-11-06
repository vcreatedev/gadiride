"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import VehicleRig, { type RigHandle } from "./VehicleRig";
import VehicleSvg from "./VehicleSvg";
import DriverFigure, { ARM_PIVOT } from "./DriverFigure";
import { ART, type ArtId } from "@/data/vehicleArt";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { drive, dig, prepareRig } from "@/lib/drive";
import { onReady } from "@/lib/ready";

/** Front (driver's) door of the sedan drawing, in its viewBox units (490 × 160). Hinged at the front edge. */
const DOOR = {
  x: 232,
  w: 134,
  // stops short of the front wheel arch so no wheel is cut into the door
  path: "M232,30 L298,29 Q326,30 344,48 L366,70 Q367,84 358,91 Q340,96 336,116 L334,138 L232,138 Z",
};

export type HeroVehicleHandle = { exit: () => Promise<void> };

/**
 * Page-hero vehicle that drives in from the left: wheels roll with distance, the body
 * dips as it brakes, and the JCB digs once parked. With `driver` (sedan): the driver's
 * door swings open, the chauffeur steps out and waves. `exit()` reverses it and drives off.
 * Height comes from the parent's --h CSS variable.
 */
const HeroVehicle = forwardRef<HeroVehicleHandle, { art: ArtId; color: string; driver?: boolean }>(function HeroVehicle(
  { art, color, driver = false },
  ref,
) {
  const rig = useRef<RigHandle>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const person = useRef<SVGSVGElement>(null);
  const door = useRef<HTMLDivElement>(null);
  const cabin = useRef<SVGSVGElement>(null);
  const a = ART[art];
  const [, minY, w, h] = a.viewBox;
  const groundFromBottom = ((minY + h - a.groundY) / h) * 100;
  const withDriver = driver && art === "sedan";
  const HINGE = `${((DOOR.x + DOOR.w) / w) * 100}% 50%`;
  const uid = `${art}-${color.replace("#", "")}`;

  const { contextSafe } = useGSAP(() => {
    const r = rig.current;
    const p = person.current;
    const arm = p?.querySelector("[data-arm=wave]");
    if (arm) gsap.set(arm, { svgOrigin: ARM_PIVOT, rotation: 0 });
    if (p) gsap.set(p, { xPercent: -50, transformOrigin: "50% 100%" });

    if (!r || prefersReducedMotion()) {
      gsap.set(wrap.current, { visibility: "visible" });
      if (p) gsap.set([p, cabin.current], { opacity: 1 });
      if (door.current) gsap.set(door.current, { rotationY: 68, opacity: 1, transformOrigin: HINGE });
      return;
    }
    prepareRig(r);
    const from = -(r.root.getBoundingClientRect().right + 40);
    gsap.set(r.root, { x: from });
    if (p && door.current) {
      gsap.set(p, { opacity: 0, y: "10%", scale: 0.93 });
      gsap.set(cabin.current, { opacity: 0 });
      // The car drawing already has a painted door; this hinged copy only appears once parked.
      gsap.set(door.current, { rotationY: 0, opacity: 0, transformOrigin: HINGE, filter: "brightness(1)" });
    }
    gsap.set(wrap.current, { visibility: "visible" });

    // Starts once the intro loader has finished (immediately on later navigations).
    const tl = gsap.timeline({ delay: 0.15, paused: true });
    const run = drive(r, { from, to: 0, duration: art === "jcb" ? 1.8 : 1.6, kind: "enter" });
    tl.add(run, 0);
    if (art === "jcb") tl.add(dig(r), ">-0.1");

    if (p && door.current && arm) {
      tl.addLabel("open", run.duration() + 0.35)
        .set(door.current, { opacity: 1 }, "open")
        .to(cabin.current, { opacity: 1, duration: 0.3 }, "open")
        .to(door.current, { rotationY: 68, filter: "brightness(0.82)", duration: 0.75, ease: "power2.out" }, "open")
        .to(r.body, { y: -0.8, duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut" }, "open+=0.25")
        .to(p, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power2.out" }, "open+=0.45")
        .to(arm, { rotation: -158, duration: 0.45, ease: "back.out(1.6)" }, ">0.15")
        .to(arm, { rotation: -132, duration: 0.2, yoyo: true, repeat: 5, ease: "sine.inOut" }, ">")
        .to(arm, { rotation: 0, duration: 0.5, ease: "power2.inOut" }, ">0.1");
    }
    return onReady(() => tl.play());
  }, { dependencies: [art, color, withDriver] });

  useImperativeHandle(ref, () => ({
    exit: contextSafe!(() => {
      return new Promise<void>((resolve) => {
        const r = rig.current;
        if (!r || prefersReducedMotion()) return resolve();
        gsap.killTweensOf([r.root, r.body, person.current, door.current, cabin.current]);
        const tl = gsap.timeline({ onComplete: () => resolve() });
        if (person.current && door.current) {
          // chauffeur gets back in and the door closes
          tl.to(person.current, { opacity: 0, y: "10%", scale: 0.93, duration: 0.55, ease: "power2.in" })
            .to(door.current, { rotationY: 0, filter: "brightness(1)", duration: 0.5, ease: "power2.in" }, ">-0.1")
            .to(cabin.current, { opacity: 0, duration: 0.2 }, ">-0.2")
            .set(door.current, { opacity: 0 })
            .to(r.body, { y: -0.8, duration: 0.12, yoyo: true, repeat: 1 }, ">");
        }
        const to = window.innerWidth - r.root.getBoundingClientRect().left + 60;
        tl.add(drive(r, { from: 0, to, duration: 1.3, kind: "exit" }), ">0.15");
      });
    }) as () => Promise<void>,
  }));

  const width = `min(100%, calc(var(--h) * ${(w / h).toFixed(3)}))`;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  // Hidden until the drive-in starts, so the parked vehicle never flashes before scripts load.
  return (
    <div ref={wrap} className="invisible flex w-full justify-center lg:justify-end">
      <div className="relative" style={{ width, perspective: "900px" }}>
        <VehicleRig ref={rig} art={art} color={color} width="100%" speedLines shadow="dark" />
        {withDriver && (
          <>
            {/* dark cabin revealed when the door opens */}
            <svg ref={cabin} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0 }} aria-hidden>
              <path d={DOOR.path} fill="#0b0c10" />
              <path d="M292,128 Q288,86 300,62 Q314,58 320,72 L324,128 Z" fill="#1d1f27" />
              <path d="M250,96 h40" stroke="#22252e" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <DriverFigure
              ref={person}
              className="pointer-events-none absolute h-[128%] w-auto"
              style={{ left: pct(272, w), bottom: `calc(${groundFromBottom}% - 1%)`, opacity: 0 }}
            />
            {/* the driver's door: a copy of the car drawing clipped to the door, hinged at its front edge */}
            <div ref={door} aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
              <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible">
                <defs>
                  <clipPath id={`driver-door-${uid}`}>
                    <path d={DOOR.path} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#driver-door-${uid})`}>
                  <foreignObject x="0" y="0" width={w} height={h}>
                    <VehicleSvg art={art} color={color} className="block h-full w-full" />
                  </foreignObject>
                </g>
                <rect x="244" y="80" width="18" height="4" rx="2" fill="rgba(0,0,0,0.3)" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default HeroVehicle;
