"use client";
import { createContext, useContext } from "react";
import { site as defaults } from "@/config/site";
import { GROUPS, TYPES, defaultTypePhoto, type Group, type VType } from "@/data/vehicles";
import { footerDefaults } from "@/content/defaults";
import type { Settings } from "@/lib/content";

type Ctx = { settings: Settings; groups: Group[]; types: VType[] };

const SiteCtx = createContext<Ctx>({
  settings: { ...defaults, footerBlurb: footerDefaults.blurb, showIntro: true },
  groups: GROUPS,
  types: TYPES.map((t) => ({ ...t, photo: defaultTypePhoto(t.id, t.name) })),
});

/** Makes admin-managed settings and the vehicle catalog available to client components. */
export function SiteProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export const useSite = () => useContext(SiteCtx).settings;
export const useCatalog = () => {
  const { groups, types } = useContext(SiteCtx);
  return { groups, types, group: (id: string) => groups.find((g) => g.id === id) ?? groups[0] };
};
