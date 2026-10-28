"use client";
import { selectTab } from "@/lib/events";
import { scrollToTarget } from "@/lib/lenis";
import { todayISO } from "@/lib/schema";
import type { GroupId } from "@/data/vehicles";

const PROMOS: { t: string; d: string; cta: string; tab: GroupId; preset?: () => Record<string, string>; cls: string; btn: string }[] = [
  { t: "Need it today?", d: "Same-day goods transport requests are welcome. Tell us the load and the address.", cta: "Request a truck", tab: "logistics", preset: () => ({ date: todayISO() }), cls: "bg-brand-50 text-ink-900", btn: "btn-primary" },
  { t: "Group trip?", d: "Tempo travellers and buses for weddings, tours and pilgrimages.", cta: "Plan group travel", tab: "passenger", cls: "bg-ink-800 text-white", btn: "btn bg-white text-ink-900 hover:bg-surface-100" },
  { t: "Site work?", d: "Backhoe loaders by the hour or the day, with an operator if you need one.", cta: "Hire a JCB", tab: "equipment", cls: "bg-surface-100 text-ink-900", btn: "btn-primary" },
  { t: "Want a driver?", d: "Sit back on long drives. Add a driver to any car request.", cta: "Car with driver", tab: "cars", preset: () => ({ mode: "With driver" }), cls: "bg-white text-ink-900 ring-1 ring-line", btn: "btn bg-ink-900 text-white hover:bg-ink-700" },
];

export default function Promos() {
  return (
    <section className="bg-white pb-16 md:pb-24" aria-label="Quick requests">
      <ul className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROMOS.map((p) => (
          <li key={p.t} className={`flex flex-col rounded-card p-7 ${p.cls}`}>
            <h3 className={`font-head text-2xl font-bold ${p.cls.includes("text-white") ? "text-white" : ""}`}>{p.t}</h3>
            <p className={`mt-3 text-sm leading-relaxed ${p.cls.includes("text-white") ? "text-ink-300" : "text-ink-600"}`}>{p.d}</p>
            <button type="button" className={`${p.btn} mt-8 self-start`} onClick={() => { selectTab(p.tab, p.preset?.()); scrollToTarget("#book", -100); }}>{p.cta}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
