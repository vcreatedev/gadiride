"use client";
import { useEffect, useMemo } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, ArrowRight } from "lucide-react";
import { FORMS, type Field } from "@/data/forms";
import type { FormKey } from "@/data/services";
import { buildSchema, isVisible, todayISO } from "@/lib/schema";
import { useQuote } from "./QuoteFlow";

const spanCls: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  12: "lg:col-span-12",
};

const fmtDate = (v: string) => {
  if (!v) return "";
  const d = new Date(v + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

type Props = {
  formKey: FormKey;
  idPrefix?: string;
  preset?: { values: Record<string, string>; nonce: number };
  extra?: { label: string; value: string }[];
  ctaClass?: string;
  compact?: boolean;
};

/** Config-driven request form. Validates, then hands off to the WhatsApp quote flow. */
export default function RequestForm({ formKey, idPrefix = formKey, preset, extra = [], ctaClass = "", compact = false }: Props) {
  const def = FORMS[formKey];
  const schema = useMemo(() => buildSchema(def.fields), [def]);
  const defaults = useMemo(() => Object.fromEntries(def.fields.map((f) => [f.name, f.defaultValue ?? ""])), [def]);
  const { register, handleSubmit, watch, setValue, formState } = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as never,
    defaultValues: defaults,
  });
  const values = watch();
  const { openQuote } = useQuote();

  useEffect(() => {
    if (!preset) return;
    Object.entries(preset.values).forEach(([k, v]) => setValue(k, v, { shouldDirty: true }));
  }, [preset, setValue]);

  const onSubmit = (v: Record<string, string>) => {
    const entries = def.fields
      .filter((f) => isVisible(f, v) && v[f.name])
      .map((f) => ({
        label: f.label,
        value:
          f.type === "date"
            ? fmtDate(v[f.name])
            : f.name === "duration"
            ? `${v[f.name]} ${(v.durationUnit || "").toLowerCase()}`
            : v[f.name],
      }))
      .filter((e) => !(e.label === "Hire by"));
    openQuote({ title: def.title, entries: [...extra, ...entries] });
  };

  const errors = formState.errors as FieldErrors<Record<string, string>>;

  const control = (f: Field) => {
    const id = `${idPrefix}-${f.name}`;
    const err = errors[f.name]?.message as string | undefined;
    const aria = { "aria-invalid": !!err, "aria-describedby": err ? `${id}-err` : undefined };

    let input: React.ReactNode;

    switch (f.type) {
      case "segment":
        input = (
          <div role="radiogroup" aria-labelledby={`${id}-lbl`} className="flex h-10 rounded-xl bg-surface-100 p-0.5">
            {f.options!.map((o) => (
              <label
                key={o}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-[9px] px-2 text-center text-sm font-semibold leading-tight transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500 ${
                  values[f.name] === o
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                <input type="radio" value={o} className="sr-only" {...register(f.name)} />
                {o}
              </label>
            ))}
          </div>
        );
        break;

      case "select":
        input = (
          <select
            id={id}
            className="h-10 w-full rounded-xl border border-line bg-surface-50 px-3 text-[14px] text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-none select-chevron"
            {...aria}
            {...register(f.name)}
          >
            {f.options!.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        );
        break;

      case "number":
        input = (
          <div className="flex h-10 items-center rounded-xl border border-line bg-surface-50">
            <button
              type="button"
              aria-label={`Decrease ${f.label}`}
              className="grid h-full w-9 shrink-0 place-items-center text-ink-900 hover:text-brand-600"
              onClick={() => setValue(f.name, String(Math.max(f.min ?? 0, Number(values[f.name] || 0) - 1)))}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              id={id}
              inputMode="numeric"
              className="h-full w-full min-w-0 bg-transparent text-center text-[14px] font-semibold text-ink-900 focus:outline-none"
              {...aria}
              {...register(f.name)}
            />
            <button
              type="button"
              aria-label={`Increase ${f.label}`}
              className="grid h-full w-9 shrink-0 place-items-center text-ink-900 hover:text-brand-600"
              onClick={() => setValue(f.name, String(Math.min(f.max ?? 999, Number(values[f.name] || 0) + 1)))}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        );
        break;

      case "textarea":
        input = (
          <textarea
            id={id}
            rows={3}
            placeholder={f.placeholder}
            className="w-full rounded-xl border border-line bg-surface-50 px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-none resize-none"
            {...aria}
            {...register(f.name)}
          />
        );
        break;

      default:
        input = (
          <input
            id={id}
            type={f.type}
            placeholder={f.placeholder}
            min={f.type === "date" ? (f.notBefore && values[f.notBefore]) || todayISO() : undefined}
            className="h-10 w-full rounded-xl border border-line bg-surface-50 px-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-none"
            {...aria}
            {...register(f.name)}
          />
        );
    }

    const colSpan = `col-span-12 ${
      f.type === "segment" || f.type === "select" ? "sm:col-span-6" : f.span === 3 ? "sm:col-span-6" : ""
    } ${spanCls[f.span ?? 12]}`;

    return (
      <div key={f.name} className={colSpan}>
        <span
          id={`${id}-lbl`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400"
        >
          {f.type === "segment" ? f.label : <label htmlFor={id}>{f.label}</label>}
        </span>
        {input}
        {err && (
          <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-err">
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-x-3 gap-y-3">
      {def.fields.filter((f) => isVisible(f, values)).map(control)}
      <div className={`col-span-12 pt-1 ${compact ? "" : "flex justify-end"}`}>
        <button
          type="submit"
          className={`btn-primary h-11 w-full px-7 text-[15px] font-semibold sm:w-auto ${ctaClass}`}
        >
          {def.cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
