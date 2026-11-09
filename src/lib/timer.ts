/** Countdowns for "Go live at" / "Show until" times, e.g. "2 days 4 h", "5 h 20 min", "3 min". */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** How long until (or since) a moment, in words, largest two units. */
export function spanText(ms: number): string {
  const t = Math.abs(ms);
  const days = Math.floor(t / DAY);
  const hours = Math.floor((t % DAY) / HOUR);
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (days) return hours ? `${plural(days, "day")} ${hours} h` : plural(days, "day");
  const mins = Math.floor((t % HOUR) / MINUTE);
  if (hours) return mins ? `${hours} h ${mins} min` : `${hours} h`;
  return `${Math.max(1, Math.round(t / MINUTE))} min`;
}

/** "Thu 12 Nov, 10:00" in India time. */
export function whenText(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

export type Schedule = { liveFrom?: string; liveUntil?: string };

/** Where a vehicle stands on its timers right now (null = no timer running). */
export function scheduleState({ liveFrom, liveUntil }: Schedule, now = Date.now()) {
  const from = liveFrom ? Date.parse(liveFrom) : NaN;
  const until = liveUntil ? Date.parse(liveUntil) : NaN;
  if (from > now) return { kind: "waiting" as const, text: `Goes live in ${spanText(from - now)}` };
  if (until <= now) return { kind: "ended" as const, text: `Ended ${spanText(now - until)} ago` };
  if (until > now) return { kind: "ending" as const, text: `Hides in ${spanText(until - now)}` };
  return null;
}
