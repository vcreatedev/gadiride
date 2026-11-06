"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UseFormRegisterReturn } from "react-hook-form";
import { LocateFixed, Loader2, MapPin, History, Building2 } from "lucide-react";
import { currentPlace, primeBias, recentPlaces, rememberPlace, searchPlaces, type Place } from "@/lib/places";
import { useSite } from "./SiteProvider";
import { ALL_CITIES } from "@/data/cities";

type Option = { kind: "locate" | "recent" | "city" | "result"; label: string; detail?: string; group?: string };

type Props = {
  id: string;
  reg: UseFormRegisterReturn;
  value: string;
  onPick: (label: string) => void;
  placeholder?: string;
  className?: string;
  /** Towns and cities only (e.g. a "City" field). */
  city?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

/**
 * Text field with place suggestions: "Use my current location", recent picks,
 * cities we serve, and live search as you type. The list renders in a portal so the
 * hero's overflow never clips it.
 */
export default function LocationInput({ id, reg, value, onPick, placeholder, className = "", city = false, invalid, describedBy }: Props) {
  const site = useSite();
  const listId = useId();
  const input = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; up: boolean } | null>(null);

  const q = value.trim();

  // Live search, debounced; older requests are cancelled.
  useEffect(() => {
    if (!open || q.length < 2) { setResults([]); setLoading(false); return; }
    const ctl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(() => {
      searchPlaces(q, { city, signal: ctl.signal })
        .then((r) => { setResults(r); setLoading(false); })
        .catch((e) => { if ((e as Error).name !== "AbortError") { setResults([]); setLoading(false); } });
    }, 250);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q, open, city]);

  const served = site.areas ?? [];
  const ql = q.toLowerCase();
  // Typed text: matching AP/Telangana cities first (starts-with before contains), then live results.
  const cityHits = q.length >= 1
    ? ALL_CITIES.filter((c) => c.name.toLowerCase().includes(ql))
        .sort((a, b) => Number(!a.name.toLowerCase().startsWith(ql)) - Number(!b.name.toLowerCase().startsWith(ql)))
        .slice(0, 6)
    : [];
  const hitNames = new Set(cityHits.map((c) => c.name.toLowerCase()));
  const options: Option[] = [
    { kind: "locate", label: locating ? "Finding your location…" : "Use my current location" },
    ...(q.length < 1
      ? [
          ...recent.map((label): Option => ({ kind: "recent", label, group: "Recent" })),
          ...served.filter((c) => !recent.includes(c)).map((label): Option => ({ kind: "city", label, group: "Hyderabad pickup areas" })),
          ...ALL_CITIES.map((c): Option => ({ kind: "city", label: c.name, detail: c.state, group: c.state })),
        ]
      : [
          ...cityHits.map((c): Option => ({ kind: "city", label: c.name, detail: c.state })),
          ...results
            .filter((p) => !(hitNames.has(p.label.toLowerCase()) && !p.detail?.includes(",")))
            .map((p): Option => ({ kind: "result", label: p.label, detail: p.detail })),
        ]),
  ];

  // Keep the list attached to the field while scrolling or resizing.
  useLayoutEffect(() => {
    if (!open) return;
    let raf = 0;
    const place = () => {
      const r = input.current?.parentElement?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom;
      const top = input.current?.parentElement?.parentElement?.getBoundingClientRect().top ?? r.top; // above the field label
      const up = below < 260 && r.top > below;
      const next = { left: r.left, width: Math.max(r.width, 280), top: up ? top - 6 : r.bottom + 6, up };
      setPos((p) => (p && p.left === next.left && p.top === next.top && p.width === next.width && p.up === next.up ? p : next));
    };
    const loop = () => { place(); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const show = () => { void primeBias(); setRecent(recentPlaces()); setNote(null); setActive(0); setOpen(true); };

  const pick = (label: string) => {
    onPick(label);
    rememberPlace(label);
    setOpen(false);
  };

  const locate = async () => {
    setLocating(true);
    setNote(null);
    try {
      const p = await currentPlace({ city });
      pick(p.label);
    } catch (e) {
      setOpen(true);
      setNote((e as Error).message);
    } finally {
      setLocating(false);
    }
  };

  const choose = (o: Option) => (o.kind === "locate" ? void locate() : pick(o.detail && !city ? `${o.label}, ${o.detail.split(", ").slice(0, 2).join(", ")}` : o.label));

  // Keep the keyboard-highlighted option in view in the long city list.
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (e.key === "Enter" && open && options[active] && (active > 0 || !q)) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const icon = (k: Option["kind"]) => {
    const cls = "h-4 w-4 shrink-0";
    if (k === "locate") return locating ? <Loader2 className={`${cls} animate-spin text-brand-500`} /> : <LocateFixed className={`${cls} text-brand-500`} />;
    if (k === "recent") return <History className={`${cls} text-ink-400`} />;
    if (k === "city") return <Building2 className={`${cls} text-ink-400`} />;
    return <MapPin className={`${cls} text-ink-400`} />;
  };

  return (
    <>
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        placeholder={placeholder}
        className={className}
        {...reg}
        ref={(el) => { reg.ref(el); input.current = el; }}
        onChange={(e) => { reg.onChange(e); if (!open) show(); setActive(e.target.value.trim().length >= 1 ? 1 : 0); }}
        onFocus={show}
        onClick={() => !open && show()}
        onBlur={(e) => { reg.onBlur(e); window.setTimeout(() => setOpen(false), 120); }}
        onKeyDown={onKey}
      />
      <button
        type="button"
        onClick={locate}
        title="Use my current location"
        aria-label="Use my current location"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> : <LocateFixed className="h-4 w-4" />}
      </button>

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[90] overflow-hidden rounded-xl bg-white text-ink-900 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
            style={{ left: pos.left, width: pos.width, top: pos.top, transform: pos.up ? "translateY(-100%)" : undefined }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto py-1.5">
              {options.map((o, i) => [
                o.group && o.group !== options[i - 1]?.group && (
                  <li key={`g-${o.group}`} role="presentation" className="sticky top-0 z-10 bg-surface-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                    {o.group}
                  </li>
                ),
                <li
                  key={`${o.kind}-${o.label}-${i}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o)}
                  className={`flex cursor-pointer items-center gap-3 px-3.5 ${o.group ? "py-2" : "py-2.5"} text-[14px] ${i === active ? "bg-brand-50" : ""} ${
                    o.kind === "locate" ? "border-b border-line font-semibold text-brand-700" : ""
                  }`}
                >
                  {icon(o.kind)}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{o.label}</span>
                    {o.detail && !o.group && <span className="block truncate text-xs text-ink-400">{o.detail}</span>}
                  </span>
                </li>,
              ])}
              {hint(q, loading, options.length)}
            </ul>
            {note && <p className="border-t border-line bg-surface-50 px-3.5 py-2.5 text-xs font-medium text-err">{note}</p>}
          </div>,
          document.body,
        )}
    </>
  );
}

function hint(q: string, loading: boolean, total: number) {
  if (q.length >= 2 && loading) return <li className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-ink-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Searching…</li>;
  if (q.length >= 1 && total === 1) return <li className="px-3.5 py-2.5 text-xs text-ink-400">No matches. You can keep what you typed.</li>;
  return null;
}
