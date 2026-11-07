"use client";
import { createContext, useContext } from "react";
import { site as defaults } from "@/config/site";
import { GROUPS, TYPES, defaultTypePhoto, type Group, type VType } from "@/data/vehicles";
import { footerDefaults } from "@/content/defaults";
import type { SearchBar, Settings } from "@/lib/content";
import { SEARCH_CTA, TAB_IDS } from "@/lib/search";

type Ctx = { settings: Settings; groups: Group[]; types: VType[]; searchBar?: SearchBar };

const SEARCH_BAR: SearchBar = {
  badge: "Confirmed on WhatsApp",
  tabs: Object.fromEntries(TAB_IDS.map((t) => [t, { label: "", search: SEARCH_CTA[t] }])) as SearchBar["tabs"],
  forms: {},
};

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
/** Search bar texts and the admin's changes to each form (Home → Search bar). */
export const useSearchBar = () => useContext(SiteCtx).searchBar ?? SEARCH_BAR;
export const useCatalog = () => {
  const { groups, types } = useContext(SiteCtx);
  return { groups, types, group: (id: string) => groups.find((g) => g.id === id) ?? groups[0] };
};
