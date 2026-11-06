"use client";
import { selectTab } from "@/lib/events";
import { scrollToTarget } from "@/lib/lenis";
import { todayISO } from "@/lib/schema";
import type { GroupId } from "@/data/vehicles";
import type { HomeContent } from "@/content/defaults";

const TONES: Record<string, { card: string; btn: string; dark?: boolean; checker?: boolean }> = {
  brand: { card: "bg-brand-50 text-ink-900 ring-1 ring-brand-100", btn: "btn-primary" },
  dark: { card: "bg-ink-800 text-white", btn: "btn bg-white text-ink-900 hover:bg-surface-100", dark: true },
  taxi: { card: "bg-taxi text-ink-900", btn: "btn bg-ink-900 text-white hover:bg-ink-700", checker: true },
  light: { card: "bg-white text-ink-900 ring-1 ring-line", btn: "btn bg-ink-900 text-white hover:bg-ink-700" },
};

/** Presets applied to the booking form, keyed by group, so a promo can pre-fill something useful. */
const PRESET: Partial<Record<GroupId, () => Record<string, string>>> = {
  logistics: () => ({ date: todayISO() }),
};

export default function Promos({ items }: { items: HomeContent["promos"] }) {
  if (!items.length) return null;
  return (
    <section className="bg-white pb-16 md:pb-24" aria-label="Quick requests">
      <ul className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => {
          const t = TONES[p.tone] ?? TONES.light;
          const group = (p.group || "cars") as GroupId;
          return (
            <li key={p.title} className={`relative flex flex-col overflow-hidden rounded-card p-7 transition-transform duration-300 hover:-translate-y-1 ${t.card}`}>
              {t.checker && <span aria-hidden className="checker absolute right-0 top-0 h-5 w-20 opacity-90" />}
              <h3 className={`font-head text-2xl font-semibold ${t.dark ? "text-white" : ""}`}>{p.title}</h3>
              <p className={`mt-3 text-sm leading-relaxed ${t.dark ? "text-ink-300" : "text-ink-700"}`}>{p.text}</p>
              <button
                type="button"
                className={`${t.btn} mt-8 self-start`}
                onClick={() => {
                  const isDriver = /driver/i.test(p.cta + p.title) && group === "cars";
                  selectTab(group, isDriver ? { mode: "With driver" } : PRESET[group]?.());
                  scrollToTarget("#book", -100);
                }}
              >
                {p.cta}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
