"use client";
import { useEffect, useMemo } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, ArrowRight, MapPin, CalendarDays, Clock, Car, Building2, Users, Package, Briefcase, Search, X, Check, type LucideIcon } from "lucide-react";
import { FORMS, type Field } from "@/data/forms";
import type { FormKey } from "@/data/services";
import { buildSchema, isVisible, todayISO } from "@/lib/schema";
import { buildDirectMessage, openWhatsApp } from "@/lib/whatsapp";
import { requestEntries } from "@/lib/request";
import { useCatalog, useSite } from "./SiteProvider";
import LocationInput from "./LocationInput";

const PLACE = /pickup|drop|from|^to$|site|location|destination|route|city/i;
/** Text fields that get place suggestions and "use my current location". */
/** Two-option choices longer than this (total characters) get a full row in the compact form. */
const WIDE_SEGMENT_CHARS = 22;
const isPlace = (f: Field) => f.type === "text" && PLACE.test(f.name) && f.name !== "route";
function iconFor(f: Field): LucideIcon | null {
  if (f.type === "date") return CalendarDays;
  if (f.type === "time") return Clock;
  if (f.type === "textarea" || f.type === "segment") return null;
  if (PLACE.test(f.name)) return MapPin;
  if (/carType|vehicle|machine/.test(f.name)) return Car;
  if (/company/.test(f.name)) return Building2;
  if (/passengers|fleet/.test(f.name)) return Users;
  if (/goods|weight/.test(f.name)) return Package;
  if (/role|service|experience/.test(f.name)) return Briefcase;
  return null;
}

const spanCls: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  12: "lg:col-span-12",
};


type Props = {
  formKey: FormKey;
  idPrefix?: string;
  preset?: { values: Record<string, string>; nonce: number };
  extra?: { label: string; value: string }[];
  ctaClass?: string;
  compact?: boolean;
  /** "bar": hero search-bar layout (option toggles on top, one connected field bar + button). */
  layout?: "grid" | "bar";
  /** When set, submitting runs a search with the values instead of opening WhatsApp. */
  onSearch?: (values: Record<string, string>) => void;
  /** Overrides the submit button label. */
  ctaLabel?: string;
  /** Called after "Clear all" resets the fields. */
  onClear?: () => void;
  /** Field names to leave out (e.g. the car type on a car's own page). */
  hide?: string[];
  /** Bar layout colours: on a light card or a dark one. */
  tone?: "light" | "dark";
};

/** Config-driven request form. Validates, then hands off to the WhatsApp quote flow. */
export default function RequestForm({ formKey, idPrefix = formKey, preset, extra = [], ctaClass = "", compact = false, layout = "grid", onSearch, ctaLabel, onClear, hide, tone = "light" }: Props) {
  const site = useSite();
  const { types } = useCatalog();
  // Vehicle dropdowns list the vehicle types managed in the admin.
  const def = useMemo(() => {
    const base = FORMS[formKey];
    const typeNames = (g: string) => types.filter((t) => t.group === g).map((t) => t.name);
    return {
      ...base,
      fields: base.fields.filter((f) => !hide?.includes(f.name)).map((f) => {
        if (formKey === "cars" && f.name === "carType") return { ...f, options: ["Any", ...typeNames("cars")] };
        if (formKey === "passenger" && f.name === "vehicle") return { ...f, options: ["Any", ...typeNames("passenger")] };
        return f;
      }),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, types, hide?.join()]);
  const schema = useMemo(() => buildSchema(def.fields), [def]);
  const defaults = useMemo(() => Object.fromEntries(def.fields.map((f) => [f.name, f.defaultValue ?? ""])), [def]);
  const { register, handleSubmit, watch, setValue, reset, formState } = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as never,
    defaultValues: defaults,
  });
  const values = watch();

  useEffect(() => {
    if (!preset) return;
    Object.entries(preset.values).forEach(([k, v]) => setValue(k, v, { shouldDirty: true }));
  }, [preset, setValue]);

  const onSubmit = (v: Record<string, string>) => {
    // Fields not shown in the search bar keep their defaults; leave them out of the request.
    const shown = (layout === "bar" ? def.fields.filter((f) => f.bar !== false) : def.fields).filter((f) => isVisible(f, v));
    const sent = Object.fromEntries(Object.entries(v).filter(([k]) => shown.some((f) => f.name === k)));
    if (onSearch) return onSearch(sent);
    openWhatsApp(buildDirectMessage(def.title, [...extra, ...requestEntries(formKey, sent, shown)]), site.whatsappNumber);
  };

  const errors = formState.errors as FieldErrors<Record<string, string>>;

  // Anything entered or changed from the starting values?
  const dirty = def.fields.some((f) => (values[f.name] ?? "") !== (defaults[f.name] ?? ""));
  const clear = () => {
    reset(defaults);
    onClear?.();
  };

  // Compact layout pairs short fields two to a row; a short field with no partner takes the full row.
  // Choice buttons with long labels ("With operator / Without operator") need the full row to fit.
  const fullRow = (f: Field) =>
    f.type === "text" || f.type === "textarea" ||
    (f.type === "segment" && ((f.options?.length ?? 0) > 2 || (f.options ?? []).join("").length > WIDE_SEGMENT_CHARS));
  const halfWidth = new Set<string>();
  if (compact) {
    let pending: string | null = null;
    for (const f of def.fields.filter((x) => isVisible(x, values))) {
      if (fullRow(f)) { pending = null; continue; }
      if (pending) { halfWidth.add(pending).add(f.name); pending = null; } else pending = f.name;
    }
  }

  const control = (f: Field) => {
    const id = `${idPrefix}-${f.name}`;
    const err = errors[f.name]?.message as string | undefined;
    const aria = { "aria-invalid": !!err, "aria-describedby": err ? `${id}-err` : undefined };

    const Icon = iconFor(f);
    const label = f.type === "segment" ? f.label : <label htmlFor={id}>{f.label}</label>;
    const shell = `group/f relative rounded-2xl bg-surface-50 ring-1 transition-all duration-200 hover:ring-ink-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-400 focus-within:shadow-[0_0_0_5px_rgba(244,122,22,0.12)] ${
      err ? "ring-err" : "ring-line"
    }`;
    // Dates/times squeezed into a half-width column get a slightly smaller inset; full-width ones line up with the rest.
    const picker = f.type === "date" || f.type === "time";
    const pad = Icon ? (picker && halfWidth.has(f.name) ? "pl-10" : "pl-11") : "pl-4";
    const lbl = (
      <span id={`${id}-lbl`} className={`pointer-events-none absolute top-2.5 ${pad} text-[11px] font-semibold leading-none uppercase tracking-[0.06em] text-ink-400 transition-colors group-focus-within/f:text-brand-600`}>
        {label}
      </span>
    );
    const icon = Icon && <Icon aria-hidden className="pointer-events-none absolute left-4 top-[46px] h-[18px] w-[18px] -translate-y-1/2 text-brand-500" />;
    const field = `peer h-[68px] w-full rounded-2xl bg-transparent ${pad} pr-4 pt-6 text-[15px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none`;

    let input: React.ReactNode;

    switch (f.type) {
      case "segment":
        input = (
          // Buttons wrap onto a second line on very narrow screens instead of spilling out of the box.
          <div className={`${shell} flex min-h-[68px] flex-col justify-end px-2.5 pb-2.5 pt-7`}>
            <span id={`${id}-lbl`} className="pointer-events-none absolute left-4 top-2.5 text-[11px] font-semibold leading-none uppercase tracking-[0.06em] text-ink-400">{f.label}</span>
            <div role="radiogroup" aria-labelledby={`${id}-lbl`} className="flex flex-wrap gap-1.5">
              {f.options!.map((o) => (
                <label
                  key={o}
                  className={`flex h-[30px] min-w-fit flex-1 basis-0 cursor-pointer select-none items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-semibold transition-all active:scale-[0.97] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-brand-500 ${
                    values[f.name] === o
                      ? "bg-brand-gradient text-white shadow-[0_4px_12px_-4px_rgba(232,84,12,0.6)]"
                      : "bg-white text-ink-700 shadow-sm ring-1 ring-ink-300/70 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-400"
                  }`}
                >
                  <input type="radio" value={o} className="sr-only" {...register(f.name)} />
                  {values[f.name] === o && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
                  {o}
                </label>
              ))}
            </div>
          </div>
        );
        break;

      case "select":
        input = (
          <div className={shell}>
            {lbl}
            {icon}
            <select id={id} className={`${field} select-chevron cursor-pointer appearance-none`} {...aria} {...register(f.name)}>
              {f.options!.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        );
        break;

      case "number":
        input = (
          <div className={`${shell} flex h-[68px] items-end`}>
            {lbl}
            {icon}
            <input id={id} inputMode="numeric" className={`${field} min-w-0 !pr-1 tabular-nums`} {...aria} {...register(f.name)} />
            <div className="mb-[18px] mr-2.5 flex shrink-0 gap-1">
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-label={`${d < 0 ? "Decrease" : "Increase"} ${f.label}`}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-ink-900 ring-1 ring-line transition-colors hover:bg-brand-500 hover:text-white hover:ring-brand-500"
                  onClick={() => setValue(f.name, String(Math.min(f.max ?? 999, Math.max(f.min ?? 0, Number(values[f.name] || 0) + d))))}
                >
                  {d < 0 ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>
        );
        break;

      case "textarea":
        input = (
          <div className={shell}>
            {lbl}
            <textarea id={id} rows={3} placeholder={f.placeholder} className={`w-full resize-none rounded-2xl bg-transparent ${pad} pb-3 pr-4 pt-8 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none`} {...aria} {...register(f.name)} />
          </div>
        );
        break;

      default:
        input = isPlace(f) ? (
          <div className={`${shell} flex items-start pr-2 [&>button]:mt-[30px]`}>
            {lbl}
            {icon}
            <LocationInput
              id={id}
              reg={register(f.name)}
              value={values[f.name] ?? ""}
              onPick={(v) => setValue(f.name, v, { shouldValidate: true, shouldDirty: true })}
              placeholder={f.placeholder}
              city={f.name === "city"}
              invalid={!!err}
              describedBy={err ? `${id}-err` : undefined}
              className={`${field} min-w-0 !pr-1`}
            />
          </div>
        ) : (
          <div className={shell}>
            {lbl}
            {icon}
            <input
              id={id}
              type={f.type}
              placeholder={f.placeholder}
              min={f.type === "date" ? (f.notBefore && values[f.notBefore]) || todayISO() : undefined}
              className={`${field} ${f.type === "date" || f.type === "time" ? "picker-full cursor-pointer !pr-1 !text-[14px] tabular-nums" : ""}`}
              {...aria}
              {...register(f.name)}
            />
          </div>
        );
    }

    // Compact (narrow side panel): places and notes full width, everything else in two columns.
    const colSpan = compact
      ? `col-span-12 ${halfWidth.has(f.name) ? "sm:col-span-6" : ""}`
      : fullRow(f) && f.type === "segment"
        ? "col-span-12"
        : `col-span-12 ${f.type === "segment" || f.type === "select" ? "sm:col-span-6" : f.span === 3 ? "sm:col-span-6" : ""} ${spanCls[f.span ?? 12]}`;

    return (
      <div key={f.name} className={colSpan}>
        {input}
        {err && (
          <p id={`${id}-err`} role="alert" className="mt-1.5 pl-1 text-xs font-medium text-err">
            {err}
          </p>
        )}
      </div>
    );
  };

  /* ---------- Bar layout: one row of labelled boxes, like a booking site ---------- */

  if (layout === "bar") {
    const isMain = (f: Field) => f.type === "text" || f.type === "date" || f.type === "time";
    const fields = def.fields.filter((f) => f.bar !== false && f.type !== "textarea" && isVisible(f, values));
    // Switches that change the other fields (e.g. Self drive / With driver) first, then trip details, then preferences.
    const controls = new Set(def.fields.map((f) => f.showIf?.field).filter(Boolean));
    const isControl = (f: Field) => controls.has(f.name);
    const ordered = [...fields.filter(isControl), ...fields.filter((f) => !isControl(f) && isMain(f)), ...fields.filter((f) => !isControl(f) && !isMain(f))];
    // Same column widths on every service: places wide, dates medium, times narrow, button fixed.
    const col = (f: Field) => (isControl(f) ? "minmax(9.5rem,0.9fr)" : f.type === "text" ? "minmax(0,1.4fr)" : f.type === "time" ? "minmax(0,0.75fr)" : "minmax(0,1fr)");
    const cols = [...ordered.map(col), "170px"].join(" ");

    const box = (f: Field) => {
      const id = `${idPrefix}-${f.name}`;
      const err = errors[f.name]?.message as string | undefined;
      // Icons only where they add meaning (places, people); labels cover the rest.
      const Icon = f.type === "text" ? MapPin : /passengers|helpers/.test(f.name) ? Users : null;
      const ctl = "h-full w-full min-w-0 bg-transparent text-[14px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none";
      let control: React.ReactNode;
      if (f.type === "segment" || f.type === "select") {
        control = (
          <select id={id} className={`${ctl} select-chevron cursor-pointer appearance-none !bg-[length:16px] !bg-[right_0px_center] pr-6`} {...register(f.name)}>
            {f.options!.map((o) => <option key={o}>{o}</option>)}
          </select>
        );
      } else if (isPlace(f)) {
        control = (
          <LocationInput
            id={id}
            reg={register(f.name)}
            value={values[f.name] ?? ""}
            onPick={(v) => setValue(f.name, v, { shouldValidate: true, shouldDirty: true })}
            placeholder={f.placeholder}
            city={f.name === "city"}
            invalid={!!err}
            describedBy={err ? `${id}-err` : undefined}
            className={ctl}
          />
        );
      } else {
        control = (
          <input
            id={id}
            type={f.type === "number" ? "number" : f.type}
            inputMode={f.type === "number" ? "numeric" : undefined}
            min={f.type === "date" ? (f.notBefore && values[f.notBefore]) || todayISO() : f.min}
            max={f.max}
            placeholder={f.placeholder}
            className={`${ctl} ${f.type === "date" || f.type === "time" ? "picker-full cursor-pointer tabular-nums" : ""}`}
            aria-invalid={!!err}
            aria-describedby={err ? `${id}-err` : undefined}
            {...register(f.name)}
          />
        );
      }
      return (
        <div key={f.name} className={`min-w-0 ${f.type === "text" ? "col-span-2 sm:col-span-1" : ""}`}>
          <label htmlFor={id} className={`mb-1.5 block truncate text-[13px] ${tone === "dark" ? "font-medium text-white/80" : "font-semibold text-ink-700"}`}>{f.label}</label>
          <div className={`flex h-11 items-center gap-2 rounded-lg px-3 transition ${
            tone === "dark"
              ? `bg-white ring-2 ${err ? "ring-err" : "ring-transparent focus-within:ring-brand-400"}`
              : `bg-surface-50 ring-1 hover:ring-ink-300 focus-within:bg-white focus-within:ring-2 ${err ? "ring-err" : "ring-line focus-within:ring-brand-400"}`
          }`}>
            {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0 text-ink-400" />}
            {control}
          </div>
          {err && <p id={`${id}-err`} role="alert" className={`mt-1 text-xs font-medium ${tone === "dark" ? "text-brand-300" : "text-err"}`}>{err}</p>}
        </div>
      );
    };

    return (
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 items-start gap-3 lg:[grid-template-columns:var(--bar-cols)]"
        style={{ ["--bar-cols" as string]: cols }}
      >
        {ordered.map(box)}
        <div className="col-span-2 lg:col-span-1">
          <div className={`mb-1.5 h-[19.5px] items-center justify-end ${dirty ? "flex" : "hidden lg:flex"}`}>
            {dirty && (
              <button
                type="button"
                onClick={clear}
                className={`inline-flex items-center gap-1 rounded text-[13px] font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 ${tone === "dark" ? "text-white/70 hover:text-white" : "text-ink-500 hover:text-ink-900"}`}
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>
          <button type="submit" className={`btn-primary h-11 min-h-0 w-full whitespace-nowrap rounded-lg px-5 text-[15px] ${ctaClass}`}>
            <Search className="h-4 w-4" />
            {ctaLabel ?? def.cta}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-3">
      {def.fields.filter((f) => isVisible(f, values)).map(control)}
      <div className={`col-span-12 pt-1 ${compact ? "" : "flex justify-end"}`}>
        <button
          type="submit"
          className={`btn-primary group/cta h-14 w-full rounded-2xl px-8 text-base font-semibold ${compact ? "" : "sm:w-auto"} ${ctaClass}`}
        >
          {ctaLabel ?? def.cta}
          <ArrowRight className="h-5 w-5 transition-transform group-hover/cta:translate-x-1" />
        </button>
      </div>
    </form>
  );
}
