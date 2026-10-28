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
