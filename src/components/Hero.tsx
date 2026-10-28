"use client";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import VehicleRig, { type RigHandle } from "./VehicleRig";
import BookingCard from "./BookingCard";
import { Skyline, Lamps, Road } from "./Scenery";
import { GROUPS, type GroupId } from "@/data/vehicles";
import type { ArtId } from "@/data/vehicleArt";
import { gsap, SplitText, useGSAP, prefersReducedMotion, isSmallScreen } from "@/lib/motion";
import { drive, dig, prepareRig } from "@/lib/drive";
import { onReady } from "@/lib/ready";

const HERO_WIDTH: Record<ArtId, string> = {
  hatch: "min(44vw,560px)", sedan: "min(50vw,640px)", suv: "min(50vw,640px)", pickup: "min(52vw,660px)",
  van: "min(54vw,700px)", truck: "min(56vw,720px)", bus: "min(62vw,820px)", jcb: "min(50vw,640px)",
};
const HERO_WIDTH_SM: Record<ArtId, string> = {
  hatch: "78vw", sedan: "86vw", suv: "86vw", pickup: "88vw", van: "92vw", truck: "96vw", bus: "100vw", jcb: "90vw",
};

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const rig = useRef<RigHandle>(null);
  const [group, setGroup] = useState<GroupId>("cars");
  const g = GROUPS.find((x) => x.id === group)!;
  const [shown, setShown] = useState<{ art: ArtId; color: string }>({ art: g.art, color: g.color });
  const busy = useRef(false);
  const queued = useRef<GroupId | null>(null);
  const first = useRef(true);
  const [small, setSmall] = useState(false);

  useEffect(() => setSmall(isSmallScreen()), []);

  // Intro: wait for the loader, then drive in while the scenery tracks the vehicle.
  useGSAP(() => {
    const q = gsap.utils.selector(section);
    const reduced = prefersReducedMotion();
    const split = SplitText.create(q("[data-hero-title]")[0], { type: "lines", mask: "lines" });
    gsap.set(split.lines, { yPercent: reduced ? 0 : 110 });
    gsap.set(q("[data-hero-sub], [data-hero-ctas]"), { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 });
    gsap.set(q("[data-hero-card]"), { opacity: reduced ? 1 : 0, y: reduced ? 0 : 40 });
    if (!reduced && rig.current) gsap.set(rig.current.root, { x: -window.innerWidth });

    return onReady(() => {
      if (reduced || !rig.current) {
        gsap.set(split.lines, { yPercent: 0 });
        return;
      }
      const r = rig.current;
      prepareRig(r);
      const from = -window.innerWidth * 1.1;
      const tl = gsap.timeline();
      tl.add(drive(r, { from, to: 0, duration: 2.1, kind: "enter" }), 0)
        .fromTo(q("[data-layer=sky]"), { xPercent: 0 }, { xPercent: -8, duration: 2.1, ease: "power3.out" }, 0)
        .fromTo(q("[data-layer=lamps]"), { xPercent: 0 }, { xPercent: -22, duration: 2.1, ease: "power3.out" }, 0)
        .fromTo(q("[data-dash]"), { xPercent: 0 }, { xPercent: -30, duration: 2.1, ease: "power3.out" }, 0)
        .to(split.lines, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: "power4.out" }, 0.5)
        .to(q("[data-hero-sub], [data-hero-ctas]"), { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 0.9)
        .to(q("[data-hero-card]"), { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 1.25);
    });
  }, { scope: section });

  // Tab switch: current vehicle pulls away, the next one drives in.
  const swap = (next: GroupId) => {
    setGroup(next);
    const r = rig.current;
    const target = GROUPS.find((x) => x.id === next)!;
    if (!r || prefersReducedMotion()) { setShown({ art: target.art, color: target.color }); return; }
    if (busy.current) { queued.current = next; return; }
    busy.current = true;
    const x = gsap.getProperty(r.root, "x") as number;
    drive(r, { from: x, to: window.innerWidth * 1.1, duration: 0.9, kind: "exit" })
      .eventCallback("onComplete", () => setShown({ art: target.art, color: target.color }));
  };

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    const r = rig.current;
    if (!r || prefersReducedMotion()) return;
    prepareRig(r);
    gsap.set(r.body, { rotation: 0, y: 0 });
    const tl = drive(r, { from: -window.innerWidth * 1.1, to: 0, duration: 1.5, kind: "enter" });
    if (shown.art === "jcb") tl.add(dig(r), ">-0.2");
    tl.eventCallback("onComplete", () => {
      busy.current = false;
      const q = queued.current;
      queued.current = null;
      if (q && GROUPS.find((x) => x.id === q)!.art !== shown.art) swap(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  return (
    <section ref={section} className="relative bg-surface-50">
      <div className="relative isolate overflow-hidden bg-ink-900 pt-[72px] text-white">
        {/* Scenery layers: sky, skyline, lamps and road move at different rates while the camera tracks the vehicle. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0f1012_0%,#16171b_40%,#2a1a12_70%,#3b2114_100%)]" />
          <div data-layer="sky" className="absolute bottom-[150px] left-0 h-[38%] w-[160%] opacity-90 md:bottom-[190px]">
            <Skyline className="h-full w-full" />
          </div>
          <div data-layer="lamps" className="absolute bottom-[150px] left-0 h-[26%] w-[220%] md:bottom-[190px]">
            <Lamps className="h-full w-full" />
          </div>
          <Road className="absolute inset-x-0 bottom-0 h-[150px] overflow-hidden md:h-[190px]" />
        </div>

        <div className="container-x relative z-10 pb-[calc(40vw+120px)] pt-10 sm:pb-[calc(32vw+130px)] md:pb-[calc(26vw+150px)] md:pt-16 lg:pb-[290px] lg:pt-14">
          <h1 data-hero-title className="display max-w-[14ch] text-[3.1rem] text-white xs:text-[3.5rem] sm:text-7xl lg:text-[5.75rem]">
            Every vehicle. Every journey. One adda<span className="text-brand-500">.</span>
          </h1>
          <p data-hero-sub className="lead mt-6 text-ink-300">
            From city cars and group travel to trucks and JCBs. Tell us what you need and get a quote on WhatsApp.
          </p>
          <div data-hero-ctas className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className="btn-primary">Find your vehicle</a>
            <Link href="/services/" className="btn border border-white/25 text-white hover:bg-white/10">Explore our services</Link>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[72px] left-0 right-0 md:bottom-[100px]">
          <div className="container-x flex justify-center md:justify-end">
            <VehicleRig
              key={shown.art + shown.color}
              ref={rig}
              art={shown.art}
              color={shown.color}
              width={small ? HERO_WIDTH_SM[shown.art] : HERO_WIDTH[shown.art]}
              title={`${g.name} illustration`}
              speedLines
              shadow="dark"
            />
          </div>
        </div>
      </div>

      <div className="container-x relative z-20 -mt-12 pb-10 md:-mt-16">
        <BookingCard onTabChange={swap} />
      </div>
    </section>
  );
}
