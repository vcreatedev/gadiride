"use client";
import { useEffect, useRef, useState } from "react";
import { markReady, whenIdle } from "@/lib/ready";

const WORD = "Gadiride".split("");
/** Letter colours sampled along the logo gradient (#FDB022 → #F47A16 → #E8540C). */
const SHADES = ["#FDB022", "#FCA61F", "#FA9A1C", "#F78C19", "#F47A16", "#F06C13", "#EC6010", "#E8540C"];
/** Length of the CSS intro (see .ld-* in globals.css). The loader never closes before this. */
const INTRO_MS = 1800;
/** Longest the loader may stay up on a slow connection. */
const MAX_WAIT_MS = 8000;

/** Resolves once every image visible in the first screen has decoded (so nothing pops in after the reveal). */
function firstScreenImagesDecoded(): Promise<void> {
  const fold = window.innerHeight;
  const imgs = Array.from(document.images).filter((img) => {
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.top < fold && r.bottom > 0;
  });
  return Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => undefined);
}

/**
 * Logo intro on every full page load or reload (not on in-app navigation).
 * The animation is pure CSS (transform/opacity), so it starts at first paint and
 * stays smooth while the page's scripts load. JS only decides when to fade it out:
 * after the intro has played and the page has finished loading.
 */
export default function Loader({ enabled = true }: { enabled?: boolean }) {
  const [state, setState] = useState<"on" | "out" | "done">(enabled ? "on" : "done");
  const exitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (!enabled) { markReady(); return; }
    html.style.overflow = "hidden";

    let exiting = false;
    const timers: number[] = [];
    const exit = () => {
      if (exiting) return;
      exiting = true;
      setState("out");
      markReady(); // hero vehicle starts driving as the loader fades
      timers.push(window.setTimeout(() => { html.style.overflow = ""; setState("done"); }, 550));
    };
    exitRef.current = exit;

    // 1. The intro always plays to the end: wait for every one of its animations to finish
    //    (measured from when they really started, however slow the first paint was).
    const root = document.getElementById("ga-loader");
    const introDone = new Promise<void>((resolve) => {
      const anims = (root?.getAnimations?.({ subtree: true }) ?? []).filter((an) => an.effect?.getTiming().iterations !== Infinity);
      if (!anims.length) { timers.push(window.setTimeout(resolve, INTRO_MS)); return; }
      Promise.all(anims.map((an) => an.finished.catch(() => undefined))).then(() => resolve());
    });
    // 2. ...and the site is really ready behind it: page loaded, fonts in (no text jump), every image
    //    in the first screen decoded, and the browser idle (so the reveal and the car's drive-in are smooth).
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const fontsReady = document.fonts ? document.fonts.ready.then(() => undefined, () => undefined) : Promise.resolve();
    const siteReady = Promise.all([pageLoaded, fontsReady])
      .then(firstScreenImagesDecoded)
      .then(() => new Promise<void>((resolve) => { whenIdle(resolve, 1500); }));
    // A very slow network still gets in, but never before the intro has finished.
    introDone
      .then(() => Promise.race([siteReady, new Promise<void>((resolve) => { timers.push(window.setTimeout(resolve, MAX_WAIT_MS - INTRO_MS)); })]))
      .then(() => timers.push(window.setTimeout(exit, 150)));

    return () => { timers.forEach(clearTimeout); html.style.overflow = ""; };
  }, [enabled]);

  if (state === "done") return null;
  return (
    <div
      id="ga-loader"
      className={`ld fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-900 ${state === "out" ? "ld-out" : ""}`}
      role="status"
      aria-label="Loading Gadiride"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_50%,rgba(244,122,22,0.14),transparent_70%)]" />

      <div className="ld-logo relative select-none font-brand font-semibold leading-none" aria-hidden>
        <svg viewBox="0 0 420 60" className="absolute -top-[0.62em] left-[2%] h-[0.6em] w-[78%] overflow-visible text-[clamp(3.5rem,14vw,8.5rem)]">
          <defs>
            <linearGradient id="ld-swoosh" x1="0" x2="1">
              <stop offset="0" stopColor="#FDB022" />
              <stop offset="0.6" stopColor="#F47A16" />
              <stop offset="1" stopColor="#BABAC2" />
            </linearGradient>
          </defs>
          <path className="ld-swoosh" pathLength={1} d="M6 54 Q210 -22 414 40" fill="none" stroke="url(#ld-swoosh)" strokeWidth="9" strokeLinecap="round" />
        </svg>

        <div className="flex items-end text-[clamp(3.5rem,14vw,8.5rem)]">
          <span className="flex overflow-hidden pb-[0.08em]">
            {WORD.map((c, i) => (
              <span key={i} className="ld-letter inline-block" style={{ color: SHADES[i], animationDelay: `${250 + i * 55}ms` }}>{c}</span>
            ))}
          </span>
          <span className="ld-pin mb-[0.1em] ml-[0.03em] inline-block self-start">
            <svg viewBox="0 0 24 34" className="block h-[0.95em] w-[0.67em] overflow-visible">
              <defs>
                <linearGradient id="ld-pin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FA9A2A" />
                  <stop offset="1" stopColor="#E8540C" />
                </linearGradient>
              </defs>
              <path d="M12 1C6 1 1.5 5.4 1.5 11.2 1.5 18.6 12 27 12 27s10.5-8.4 10.5-15.8C22.5 5.4 18 1 12 1Z" fill="url(#ld-pin)" />
              <circle cx="12" cy="11" r="4.2" fill="#16161A" />
              <circle className="ld-dot" cx="12" cy="31" r="2.6" fill="#ffffff" />
            </svg>
          </span>
        </div>
      </div>

      <p className="ld-tag mt-6 font-head text-base font-medium tracking-wide text-ink-300 md:text-lg">Every vehicle. One ride.</p>

      <div className="absolute bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4.25rem))] h-[3px] sm:bottom-[max(3.5rem,calc(env(safe-area-inset-bottom)+2.5rem))] w-[min(70vw,320px)] overflow-hidden rounded-full bg-white/10">
        <div className={`ld-bar h-full w-full origin-left bg-brand-gradient ${state === "out" ? "ld-bar-full" : ""}`} />
      </div>

      {/* Centred under the progress bar on phones; bottom-right on larger screens. */}
      <button type="button" onClick={() => exitRef.current()} className="absolute bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-ink-300 ring-1 ring-white/15 transition-colors hover:text-white hover:ring-white/30 sm:bottom-[max(2rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:translate-x-0 sm:ring-0">
        Skip intro
      </button>
    </div>
  );
}
