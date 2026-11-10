/** Signals that the intro (loader) has finished so hero motion can begin. */
let ready = false;
const subs = new Set<() => void>();
export function markReady() {
  if (ready) return;
  ready = true;
  subs.forEach((f) => f());
  subs.clear();
}
export function onReady(cb: () => void) {
  if (ready) { cb(); return () => {}; }
  subs.add(cb);
  return () => subs.delete(cb);
}
export const isReady = () => ready;

/** Smooth frames in a row before the hero vehicle starts, and the longest it waits for them. */
const CALM_FRAMES = 3;
const CALM_FRAME_MS = 40;
const MAX_WAIT_MS = 1500;

/**
 * Runs `cb` after "ready", once the browser draws smoothly again. The setup that starts at ready
 * (scroll reveal, scroll measuring, the follow-up work GSAP queues) and the end of the page load
 * take a few long frames; the hero vehicle starts after them, so its drive never freezes halfway.
 * Waits at most MAX_WAIT_MS. Marks "hero-start" for performance checks.
 */
export function onReadyCalm(cb: () => void): () => void {
  let frame = 0;
  const off = onReady(() => {
    const start = performance.now();
    let last = start;
    let calm = 0;
    const tick = (t: number) => {
      calm = t - last < CALM_FRAME_MS ? calm + 1 : 0;
      last = t;
      if (calm >= CALM_FRAMES || t - start > MAX_WAIT_MS) {
        performance.mark("hero-start");
        cb();
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  });
  return () => { off(); cancelAnimationFrame(frame); };
}

/**
 * Runs `cb` when the browser is idle (at most `timeout` ms later). Used for page-wide setup
 * (scroll reveal, ScrollTrigger measuring) so it doesn't compete with the hero car's first drive.
 */
export function whenIdle(cb: () => void, timeout = 1800): () => void {
  const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 300);
  return () => clearTimeout(id);
}
