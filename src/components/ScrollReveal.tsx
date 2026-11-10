"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { isReady, onReady } from "@/lib/ready";

/**
 * Site-wide scroll reveal: cards, list items and marked blocks below the hero rise and fade in
 * as they enter the viewport, a few at a time. Uses GSAP's ScrollTrigger.batch (cheap: transform
 * and opacity only) and clears its inline styles afterwards so hover effects keep working.
 * Skips the hero, the marquee, forms, tab rows and anything inside [data-no-reveal].
 */
const TARGETS = [
  "main > section:not(:first-child) :is(ul, ol) > li",
  "main > section:not(:first-child) article",
  "main [data-reveal]",
].join(", ");
const SKIP = "[data-no-reveal], .marquee-track, .reviews-track, form, [role=radiogroup], [role=tablist], [aria-hidden=true], nav";

export default function ScrollReveal() {
  const path = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let triggers: ScrollTrigger[] = [];
    let items: Element[] = [];

    const start = () => {
      const all = Array.from(document.querySelectorAll(TARGETS)).filter((el) => !el.closest(SKIP));
      // Animate the outermost match only (e.g. a card, not the chips inside it).
      const set = new Set(all);
      items = all.filter((el) => {
        for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
        return true;
      });
      // Only what is still below the screen fades in later; anything already visible is left
      // exactly as it is, so nothing on screen moves when the loader closes or a page opens.
      const fold = window.innerHeight;
      items = items.filter((el) => el.getBoundingClientRect().top > fold);
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, y: 28 });
      triggers = ScrollTrigger.batch(items, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out", stagger: 0.07, overwrite: true,
            clearProps: "transform,opacity,visibility",
          }),
      });
    };

    // Wait for the loader (first visit) and for the new page's DOM (navigation).
    // First visit: right at ready, before the hero vehicle starts (it starts a frame later), so
    // this setup never runs in the middle of its drive.
    let raf = 0;
    const firstLoad = !isReady();
    const off = onReady(() => {
      if (firstLoad) start();
      else raf = requestAnimationFrame(start);
    });
    return () => {
      off();
      cancelAnimationFrame(raf);
      triggers.forEach((t) => t.kill());
      if (items.length) gsap.set(items, { clearProps: "transform,opacity,visibility" });
    };
  }, [path]);

  return null;
}
