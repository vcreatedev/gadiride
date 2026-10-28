import type Lenis from "lenis";
let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (instance = l);
export function scrollToTarget(target: string | number | HTMLElement, offset = -80) {
  if (instance) instance.scrollTo(target, { offset, duration: 1.2 });
  else if (typeof target === "number") window.scrollTo({ top: target + offset });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) window.scrollTo({ top: (el as HTMLElement).getBoundingClientRect().top + window.scrollY + offset });
  }
}
