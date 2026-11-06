import type { GroupId } from "@/data/vehicles";
export const TAB_EVENT = "ga:tab";
export function selectTab(tab: GroupId | "driver", preset?: Record<string, string>) {
  window.dispatchEvent(new CustomEvent(TAB_EVENT, { detail: { tab, preset } }));
}
