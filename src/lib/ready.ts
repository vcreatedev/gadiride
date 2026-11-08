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
