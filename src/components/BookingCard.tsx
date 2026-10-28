"use client";
import { useEffect, useRef, useState } from "react";
import { GROUPS, type GroupId } from "@/data/vehicles";
import CategoryIcon from "./CategoryIcon";
import RequestForm from "./RequestForm";
import MobileBookingForm from "./MobileBookingForm";
import { TAB_EVENT } from "@/lib/events";
import { todayISO } from "@/lib/schema";
import { gsap } from "@/lib/motion";
import { Plane, CalendarRange, MapPinned, Zap, UserRound, KeyRound } from "lucide-react";

const CHIPS: { label: string; icon: typeof Plane; tab: GroupId; values: Record<string, string> }[] = [
  { label: "Self drive", icon: KeyRound, tab: "cars", values: { mode: "Self drive" } },
  { label: "With driver", icon: UserRound, tab: "cars", values: { mode: "With driver" } },
  { label: "Airport", icon: Plane, tab: "cars", values: { pickup: "Airport" } },
  { label: "Outstation", icon: MapPinned, tab: "passenger", values: { tripType: "Outstation" } },
  { label: "Same day", icon: Zap, tab: "logistics", values: { date: "" } },
  { label: "Monthly", icon: CalendarRange, tab: "cars", values: {} },
];

export default function BookingCard({ onTabChange }: { onTabChange?: (g: GroupId) => void }) {
  const [tab, setTab] = useState<GroupId>("cars");
  const [preset, setPreset] = useState<{ values: Record<string, string>; nonce: number } | undefined>();
  const [chip, setChip] = useState<string | null>(null);
  const formWrap = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const change = (g: GroupId, values?: Record<string, string>) => {
    setTab(g);
    onTabChange?.(g);
    setPreset(values ? { values, nonce: Date.now() } : undefined);
  };

  useEffect(() => {
    const h = (e: Event) => {
      const { tab: t, preset: p } = (e as CustomEvent).detail;
      change(t, p);
    };
    window.addEventListener(TAB_EVENT, h);
    return () => window.removeEventListener(TAB_EVENT, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sliding active pill + field cross-fade for desktop.
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
    const next = GROUPS[(i + (e.key === "ArrowRight" ? 1 : GROUPS.length - 1)) % GROUPS.length];
    change(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div id="book" className="scroll-mt-28">
      {/* Mobile Form View: Sleek, compact, matching the mobile reference design */}
      <div className="md:hidden">
        <div data-hero-card className="rounded-[28px] bg-white p-5 shadow-float">
          <MobileBookingForm activeTab={tab} onTabChange={change} />
        </div>
      </div>

      {/* Desktop Form View: Full multi-column responsive grid */}
      <div className="hidden md:block">
        <div data-hero-card className="rounded-card bg-white p-6 shadow-float lg:p-8">
          <div role="tablist" aria-label="Vehicle group" className="no-scrollbar relative -mx-1 mb-6 flex gap-1 overflow-x-auto px-1">
            <span ref={indicator} aria-hidden className="absolute left-0 top-0 h-full rounded-full bg-ink-900" style={{ width: 0 }} />
            {GROUPS.map((g, i) => (
              <button
                key={g.id}
                ref={(el) => { tabRefs.current[g.id] = el; }}
                role="tab"
                id={`tab-${g.id}`}
                aria-selected={tab === g.id}
                aria-controls="book-panel"
                tabIndex={tab === g.id ? 0 : -1}
                onKeyDown={(e) => onKey(e, i)}
                onClick={() => change(g.id)}
                className={`relative z-10 flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-300 sm:px-5 ${
                  tab === g.id ? "text-white" : "bg-surface-50 text-ink-900 hover:bg-surface-100"
                }`}
              >
                <CategoryIcon id={g.id} className="h-5 w-6" />
                {g.short}
              </button>
            ))}
          </div>
          <div id="book-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} ref={formWrap}>
            <RequestForm key={tab} formKey={tab} idPrefix={`hero-${tab}`} preset={preset} />
          </div>
        </div>
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Quick options">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={chip === c.label}
              onClick={() => {
                setChip(c.label);
                change(c.tab, c.label === "Same day" ? { date: todayISO() } : c.values);
              }}
              className={`chip ${chip === c.label ? "chip-on" : ""}`}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
