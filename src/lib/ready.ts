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

/**
 * Runs `cb` on the frame after "ready". The page-wide setup that also starts at ready (scroll
 * reveal, ScrollTrigger measuring) runs first, all at once, so the hero vehicle's drive that starts
 * here never stops halfway while that heavy work runs.
 */
export function onReadyNextFrame(cb: () => void): () => void {
  let frame = 0;
  const off = onReady(() => {
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(cb); });
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
