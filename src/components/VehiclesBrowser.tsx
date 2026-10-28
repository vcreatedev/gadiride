"use client";
import { useEffect, useMemo, useState } from "react";
import { GROUPS, TYPES, VEHICLES, type GroupId } from "@/data/vehicles";
import VehicleCard from "./VehicleCard";
import CategoryIcon from "./CategoryIcon";

/** Filterable listing. Filters are kept in the URL query so results can be shared. */
export default function VehiclesBrowser({ lockGroup }: { lockGroup?: GroupId }) {
  const [group, setGroup] = useState<GroupId | "all">(lockGroup ?? "all");
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!lockGroup) {
      const g = p.get("group");
      if (g && GROUPS.some((x) => x.id === g)) setGroup(g as GroupId);
    }
    const t = p.get("type") || window.location.hash.slice(1);
    if (t && TYPES.some((x) => x.id === t)) setType(t);
  }, [lockGroup]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (!lockGroup && group !== "all") p.set("group", group);
    if (type !== "all") p.set("type", type);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [group, type, lockGroup]);

  const types = TYPES.filter((t) => group === "all" || t.group === group);
  const list = useMemo(() => VEHICLES.filter((v) => (group === "all" || v.group === group) && (type === "all" || v.type === type)), [group, type]);

  return (
    <div>
      {!lockGroup && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Vehicle group">
          {[{ id: "all" as const, short: "All" }, ...GROUPS].map((g) => (
            <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => { setGroup(g.id); setType("all"); }} className={`chip ${group === g.id ? "chip-on" : ""}`}>
              {g.id !== "all" && <CategoryIcon id={g.id} className="h-4 w-5" />}{g.short}
            </button>
          ))}
        </div>
      )}
      {types.length > 1 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Vehicle type">
          {[{ id: "all", name: "All types" }, ...types].map((t) => (
            <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => setType(t.id)} className={`chip h-9 ${type === t.id ? "chip-on" : ""}`}>{t.name}</button>
          ))}
        </div>
      )}
      <p className="mt-6 text-sm text-ink-400" aria-live="polite">{list.length} {list.length === 1 ? "vehicle" : "vehicles"}. Sample list, availability confirmed on request.</p>
      {list.length ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => <li key={v.slug}><VehicleCard v={v} /></li>)}
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line p-10 text-center">
          <p className="font-head text-xl font-bold text-ink-900">Nothing listed for this filter yet</p>
          <p className="mt-2">Ask us on WhatsApp. We often have more than what is listed here.</p>
          <button type="button" className="btn-secondary mt-5" onClick={() => { setGroup(lockGroup ?? "all"); setType("all"); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
