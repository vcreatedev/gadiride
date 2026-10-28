"use client";
import { useEffect, useRef, useState } from "react";
import Speedometer, { type SpeedoHandle } from "./Speedometer";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { markReady } from "@/lib/ready";

const KEY = "ga_loader_seen";

/**
 * Speedometer intro. The needle follows real loading milestones
 * (fonts ready, window load), never a fixed timer. Shown once per session.
 */
export default function Loader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const speedo = useRef<SpeedoHandle>(null);
  const streak = useRef<HTMLDivElement>(null);
  const exitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const finish = () => {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      html.style.overflow = "";
      setDone(true);
    };
    let seen = false;
    try { seen = !!sessionStorage.getItem(KEY); } catch {}
    if (seen || !root.current || !speedo.current) { markReady(); finish(); return; }

    html.style.overflow = "hidden";
    if (prefersReducedMotion()) {
      speedo.current.set(240);
      const t = gsap.to(root.current, { opacity: 0, duration: 0.4, delay: 0.3, onStart: markReady, onComplete: finish });
      exitRef.current = () => t.progress(1);
      return () => { t.kill(); };
    }

    const s = speedo.current;
    const state = { v: 0 };
    let target = 0;
    let exiting = false;
    let tween: gsap.core.Tween | null = null;
    const render = () => s.set(state.v);

    const exit = () => {
      if (exiting) return;
      exiting = true;
      tween?.kill();
      gsap.timeline({ onComplete: finish })
        .to(state, { v: 236, duration: 0.08, onUpdate: render })
        .to(state, { v: 240, duration: 0.12, onUpdate: render })
        .fromTo(streak.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.35, ease: "power3.in" })
        .add(markReady)
        .fromTo(root.current, { clipPath: "circle(75% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)", duration: 0.65, ease: "power3.inOut" }, ">-0.05");
    };
    exitRef.current = exit;

    const go = (t: number) => {
      target = Math.max(target, t);
      tween?.kill();
      tween = gsap.to(state, {
        v: target,
        duration: 0.35 + (target - state.v) / 220,
        ease: target >= 240 ? "power2.in" : "power2.out",
        onUpdate: render,
        onComplete: () => { if (target >= 240) exit(); },
      });
    };

    // Ignition: ticks light up around the dial, then the needle starts moving.
    const ign = gsap.timeline();
    ign.from(s.root, { scale: 0.92, opacity: 0, duration: 0.5, ease: "power3.out" })
      .to(s.ticks(), { opacity: 1, duration: 0.25, stagger: 0.008 }, "-=0.25")
      .add(() => go(80));

    document.fonts?.ready.then(() => go(170)).catch(() => go(170));
    const onLoad = () => go(240);
    if (document.readyState === "complete") setTimeout(onLoad, 350);
    else window.addEventListener("load", onLoad, { once: true });
    const safety = setTimeout(onLoad, 4000);

    return () => {
      clearTimeout(safety);
      window.removeEventListener("load", onLoad);
      ign.kill();
      tween?.kill();
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;
  return (
    <div id="ga-loader" ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-900" role="status" aria-label="Loading Gadiride">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_55%,rgba(242,97,29,0.10),transparent_70%)]" />
      <Speedometer ref={speedo} className="relative w-[min(78vw,460px)]" />
      <div ref={streak} aria-hidden className="pointer-events-none absolute left-0 top-1/2 h-[3px] w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-brand-500 to-white opacity-0 shadow-[0_0_24px_6px_rgba(242,97,29,0.6)]" />
      <button type="button" onClick={() => exitRef.current()} className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] right-6 rounded-full px-4 py-2 text-sm font-medium text-ink-300 transition-colors hover:text-white">
        Skip intro
      </button>
    </div>
  );
}
