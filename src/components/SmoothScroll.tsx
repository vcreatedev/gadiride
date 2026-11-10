"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { getLenis, setLenis } from "@/lib/lenis";
import { isReady, onReady } from "@/lib/ready";

/** Header height, so anchor jumps (e.g. #all) land below the fixed header. */
const HEADER_OFFSET = -80;

/**
 * Lenis smooth scrolling, synced to GSAP's ticker and ScrollTrigger.
 * Held still while the intro loader is showing, smooth for in-page anchor links,
 * and back to the top on every page change. Native scrolling for reduced motion.
 */
export default function SmoothScroll() {
  const path = usePathname();

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

  // New page: start at the top (or at its #anchor), and re-measure scroll animations.
  useEffect(() => {
    const lenis = getLenis();
    const hash = window.location.hash;
    const target = hash ? document.querySelector(hash) : null;
    if (lenis) {
      if (target) lenis.scrollTo(target as HTMLElement, { offset: HEADER_OFFSET, immediate: true });
      else lenis.scrollTo(0, { immediate: true });
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [path]);

  return null;
}
