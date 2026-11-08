"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalog, useSearchBar, useSite } from "./SiteProvider";
import type { GroupId } from "@/data/vehicles";
import CategoryIcon from "./CategoryIcon";
import RequestForm from "./RequestForm";
import { CLEAR_EVENT, TAB_EVENT, TRIP_EVENT, announceClear, announceSearch } from "@/lib/events";
import { pickFormValues } from "@/lib/request";
import { gsap } from "@/lib/motion";
import { SEARCH_CTA, type TabId } from "@/lib/search";

type Props = {
  onTabChange?: (g: GroupId) => void;
  /** Called with every tab the visitor picks, Drivers included. */
  onServiceChange?: (t: TabId) => void;
  /** Pre-select a tab and fill the fields (used on the search results page). */
  initialTab?: TabId;
  initialValues?: Record<string, string>;
  /** Show only this service (no tabs). Used on each service page and its search results. */
  lockTab?: TabId;
};

/** Search card: pick a service, enter trip details, see matching vehicles or drivers. */
export default function BookingCard({ onTabChange, onServiceChange, initialTab = "cars", initialValues, lockTab }: Props) {
  const router = useRouter();
  const { groups } = useCatalog();
  const dark = useSite().heroTheme === "dark";
  const bar = useSearchBar();
  // Tab names from Home → Search bar; empty ones use the Header menu name.
  const tabs: { id: TabId; short: string }[] = [...groups.map((g) => ({ id: g.id as TabId, short: g.short })), { id: "driver" as TabId, short: "Drivers" }].map((t) => ({
    ...t,
    short: bar.tabs[t.id]?.label || t.short,
  }));
  const [tab, setTab] = useState<TabId>(lockTab ?? initialTab);
  const [preset, setPreset] = useState<{ values: Record<string, string>; nonce: number } | undefined>(
    initialValues ? { values: initialValues, nonce: 1 } : undefined,
  );
  const formWrap = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const change = (t: TabId, values?: Record<string, string>) => {
    setTab(t);
    if (t !== "driver") onTabChange?.(t);
    onServiceChange?.(t);
    setPreset(values ? { values, nonce: Date.now() } : undefined);
  };

  // Every tab: that service's own page (vehicles or drivers), scrolled to its list and filtered there.
  const search = (values: Record<string, string>) => {
    const q = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => v && q.set(k, v));
    const path = tab === "driver" ? "/drivers/" : `/vehicles/${tab}/`;
    const url = `${path}${q.size ? `?${q.toString()}` : ""}#all`;
    if (window.location.pathname === path) {
      window.history.replaceState(null, "", url);
      announceSearch(values);
    } else router.push(url);
  };

  // Cleared from the vehicle list below: empty the fields too (a new form starts from its defaults).
  const [formRound, setFormRound] = useState(0);
  useEffect(() => {
    const c = (e: Event) => {
      if ((e as CustomEvent).detail !== "list") return;
      setPreset(undefined);
      setFormRound((n) => n + 1);
    };
    window.addEventListener(CLEAR_EVENT, c);
    // Changed from the vehicle list (passengers + / -): show the new value here.
    const t = (e: Event) => setPreset({ values: (e as CustomEvent<Record<string, string>>).detail, nonce: Date.now() });
    window.addEventListener(TRIP_EVENT, t);
    return () => { window.removeEventListener(CLEAR_EVENT, c); window.removeEventListener(TRIP_EVENT, t); };
  }, []);
  const onVehiclePage = !!lockTab && !initialValues;

  // On a vehicle page opened from a search, show what was searched.
  useEffect(() => {
    if (!lockTab || initialValues) return;
    const picked = pickFormValues(lockTab, Object.fromEntries(new URLSearchParams(window.location.search)));
    if (Object.keys(picked).length) setPreset({ values: picked, nonce: Date.now() });
  }, [lockTab, initialValues]);

  useEffect(() => {
    const h = (e: Event) => {
      const { tab: t, preset: p } = (e as CustomEvent).detail;
      change(t, p);
    };
    window.addEventListener(TAB_EVENT, h);
    return () => window.removeEventListener(TAB_EVENT, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const btn = tabRefs.current[tab];
    if (btn && indicator.current && btn.offsetWidth > 0) {
      gsap.to(indicator.current, { x: btn.offsetLeft, width: btn.offsetWidth, duration: 0.3, ease: "power3.out" });
    }
    if (formWrap.current) {
      gsap.fromTo(formWrap.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [tab]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    change(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div id="book" className="scroll-mt-28">
      <div data-hero-card className={`relative rounded-2xl p-4 sm:p-5 ${dark ? "bg-ink-900 shadow-[0_24px_60px_-20px_rgba(22,22,26,0.55)] ring-1 ring-white/10" : "bg-white shadow-[0_24px_60px_-22px_rgba(22,22,26,0.35)] ring-1 ring-black/5"}`}>
        {!lockTab && (
        <div className="relative mb-4 flex items-center justify-between gap-4">
          <div role="tablist" aria-label="What do you need?" className="no-scrollbar relative -mx-1 flex gap-1 overflow-x-auto px-1">
            <span ref={indicator} aria-hidden className="absolute left-0 top-0 h-full rounded-full bg-brand-gradient" style={{ width: 0 }} />
            {tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[t.id] = el; }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="book-panel"
                tabIndex={tab === t.id ? 0 : -1}
                onKeyDown={(e) => onKey(e, i)}
                onClick={() => change(t.id)}
                className={`relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-300 ${
                  tab === t.id ? "text-white" : dark ? "text-white/70 hover:text-white" : "text-ink-600 hover:text-ink-900"
                }`}
              >
                <CategoryIcon id={t.id} className="h-5 w-6" />
                {t.short}
              </button>
            ))}
          </div>
          <p className={`hidden shrink-0 items-center gap-2 text-sm xl:flex ${dark ? "text-white/60" : "text-ink-500"}`}>
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp" /></span>
            {bar.badge}
          </p>
        </div>
        )}
        <div id="book-panel" role={lockTab ? undefined : "tabpanel"} aria-labelledby={lockTab ? undefined : `tab-${tab}`} ref={formWrap} className="relative">
          <RequestForm key={`${tab}-${formRound}`} formKey={tab} idPrefix={`hero-${tab}`} preset={preset} layout="bar" tone={dark ? "dark" : "light"} onSearch={search} ctaLabel={bar.tabs[tab]?.search || SEARCH_CTA[tab]}
            // On the results page, clearing goes back to the service's normal page.
            onClear={initialValues && Object.keys(initialValues).length ? () => router.push(tab === "driver" ? "/drivers/" : `/vehicles/${tab}/`) : onVehiclePage ? () => announceClear("bar") : undefined} />
        </div>
      </div>
    </div>
  );
}
