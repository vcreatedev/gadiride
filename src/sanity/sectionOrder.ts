"use client";
import { useEffect, useState } from "react";
import { useClient } from "sanity";
import { HOME_SECTIONS, NAV_ITEMS, VEHICLE_PAGE_SECTIONS, type SectionSlot } from "@/data/sections";
import { apiVersion } from "./env";
import type { SectionItem } from "./pageMap";

/** Default order per document that has one ("layout" or "navOrder"). */
export const DEFAULT_SLOTS: Record<string, readonly { key: string }[]> = {
  homePage: HOME_SECTIONS,
  vehiclesPage: VEHICLE_PAGE_SECTIONS,
  siteSettings: NAV_ITEMS,
};

/** `field` is a fixed name from pageMap.ts (never user input). */
const layoutQuery = (field: string) => `coalesce(*[_id == "drafts." + $id][0].${field}, *[_id == $id][0].${field})`;

/** The editor's saved order for this page (draft first), kept live while the pane is open. */
export function useLayout(docId?: string, field = "layout"): SectionSlot[] | null {
  const client = useClient({ apiVersion });
  const [layout, setLayout] = useState<SectionSlot[] | null>(null);
  useEffect(() => {
    if (!docId) return;
    let alive = true;
    const load = () =>
      client.fetch<SectionSlot[] | null>(layoutQuery(field), { id: docId }).then(
        (l) => { if (alive) setLayout(l ?? null); },
        () => undefined, // keep the default order if the fetch fails
      );
    load();
    const sub = client.listen(`*[_id in [$id, "drafts." + $id]]`, { id: docId }, { visibility: "query" }).subscribe({ next: load, error: () => undefined });
    return () => { alive = false; sub.unsubscribe(); };
  }, [client, docId, field]);
  return layout;
}

/** Saved rows first, then any section added to the site since (shown by default). */
export function fullOrder(saved: SectionSlot[] | null, defaults: readonly { key: string }[]): SectionSlot[] {
  const known = new Set(defaults.map((d) => d.key));
  const seen = new Set<string>();
  return [...(saved ?? []), ...defaults.map((d) => ({ key: d.key, show: true }))].filter((r) => {
    if (!r?.key || !known.has(r.key) || seen.has(r.key)) return false;
    seen.add(r.key);
    return true;
  });
}

/** Puts the reorderable sections in `rows` order, leaving fixed ones (hero, footer, SEO...) in place. */
export function arrange(items: SectionItem[], rows: SectionSlot[]) {
  const rank = new Map(rows.map((r, n) => [r.key, n]));
  const hidden = new Set(rows.filter((r) => r.show === false).map((r) => r.key));
  const positions = items.flatMap((it, n) => (it.slot && rank.has(it.slot) ? [n] : []));
  const sorted = positions.map((n) => items[n]).sort((a, b) => (rank.get(a.slot ?? "") ?? 0) - (rank.get(b.slot ?? "") ?? 0));
  const out = items.map((it, n) => {
    const at = positions.indexOf(n);
    return at >= 0 ? sorted[at] : it;
  });
  return { items: out, hidden, movable: new Set(rank.keys()) };
}

/** Array items as Sanity stores them ("section" objects with a stable _key). */
export const toSanity = (rows: SectionSlot[]) =>
  rows.map((r) => ({ _key: r.key, _type: "section", key: r.key, show: r.show !== false }));

/** Stable JSON (sorted keys), so two documents compare equal regardless of key order. */
const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}`
  : JSON.stringify(v ?? null);

type Doc = Record<string, unknown>;

/**
 * True when a draft has no real changes left (ignores _id, _rev, _updatedAt...). An order
 * field that was never published counts as unchanged while it still holds the default order.
 */
export function sameContent(draft: Doc, published: Doc, order?: { field: string; defaults: readonly { key: string }[] }): boolean {
  const defaultOrder = order ? stable(toSanity(fullOrder(null, order.defaults))) : null;
  const strip = (d: Doc, isDraft: boolean) =>
    Object.fromEntries(
      Object.entries(d).filter(([k, v]) => {
        if (k.startsWith("_")) return false;
        const unpublishedDefault = isDraft && order && k === order.field && !(k in published) && stable(v) === defaultOrder;
        return !unpublishedDefault;
      }),
    );
  return stable(strip(draft, true)) === stable(strip(published, false));
}

/** Shows or hides a section on the website. */
export const toggle = (rows: SectionSlot[], key: string): SectionSlot[] =>
  rows.map((r) => (r.key === key ? { ...r, show: r.show === false } : r));
