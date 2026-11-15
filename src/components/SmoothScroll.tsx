"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { getLenis, setLenis } from "@/lib/lenis";
import { isReady, onReady } from "@/lib/ready";

/** Header height, so anchor jumps (e.g. #all) land below the fixed header. */
const HEADER_OFFSET = -80;
/** Frames to keep re-applying a Back position while the page is still getting its full height. */
const RESTORE_FRAMES = 30;

/** Where each page was scrolled to (by address), so Back / Forward return there. */
const positions = new Map<string, number>();
const address = () => window.location.pathname + window.location.search;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Scrolls to `y`, again on the next frames until the page is tall enough to get there. Returns a cancel. */
function scrollBackTo(y: number): () => void {
  let frame = 0;
  let tries = 0;
  const step = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.resize(); // the new page's height, not the previous one's
      lenis.scrollTo(y, { immediate: true, force: true });
    } else window.scrollTo(0, y);
    if (Math.abs(window.scrollY - y) > 2 && tries++ < RESTORE_FRAMES) frame = requestAnimationFrame(step);
  };
  step();
  return () => cancelAnimationFrame(frame);
}

/**
 * Lenis smooth scrolling, synced to GSAP's ticker and ScrollTrigger.
 * Held still while the intro loader is showing, smooth for in-page anchor links. A new page starts
 * at the top; Back / Forward return to where that page was. Native scrolling for reduced motion.
 */
export default function SmoothScroll() {
  const path = usePathname();
  /** Set by Back / Forward: the position to return to on the page being shown. */
  const backTo = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: HEADER_OFFSET } });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    // If the page stalls for a moment (images decoding, scripts), animations continue smoothly
    // instead of jumping ahead to catch up.
    gsap.ticker.lagSmoothing(500, 33);

    // No scrolling under the loader; release it once the site is ready.
    if (!isReady()) lenis.stop();
    const off = onReady(() => {
      lenis.start();
      // Measuring every scroll trigger is heavy: do it now, before the hero vehicle starts
      // (it starts a frame later), so it never lands in the middle of the drive.
      ScrollTrigger.refresh();
    });

    return () => {
      off();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Remember each page's position. The browser's own restoring is off: it would act before the
  // previous page is back on screen. Back / Forward read the saved position at once, before
  // anything else can scroll.
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => positions.set(address(), window.scrollY));
    };
    const onPop = () => {
      cancelAnimationFrame(frame);
      backTo.current = positions.get(address()) ?? 0;
    };
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", save);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // New page: start at the top (or at its #anchor); Back / Forward: where it was. Then re-measure
  // scroll animations, and re-apply a Back position once they have their final sizes.
  useIsoLayoutEffect(() => {
    const back = backTo.current;
    backTo.current = null;
    const lenis = getLenis();
    let cancel = back === null ? () => undefined : scrollBackTo(back);
    if (back === null && lenis) {
      const hash = window.location.hash;
      const target = hash ? document.querySelector(hash) : null;
      if (target) lenis.scrollTo(target as HTMLElement, { offset: HEADER_OFFSET, immediate: true });
      else lenis.scrollTo(0, { immediate: true });
    }
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (back !== null) {
        cancel();
        cancel = scrollBackTo(back);
      }
    });
    return () => {
      cancelAnimationFrame(id);
      cancel();
    };
  }, [path]);

  return null;
}
