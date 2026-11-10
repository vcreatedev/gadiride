import { BadgeCheck, Languages, MapPin } from "lucide-react";
import Photo from "../Photo";
import RequestButton from "./RequestButton";
import type { Driver } from "@/lib/content";
import type { Entry } from "@/lib/whatsapp";

const initials = (name: string) => name.split(/\s+/).map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase();

/** Driver profile: photo, name, area, experience / licence / duty, vehicles driven, languages and a request button. */
export default function DriverCard({ d, title, entries, requestLabel }: { d: Driver; title: string; entries: Entry[]; requestLabel: string }) {
  const stats = [
    typeof d.experience === "number" && { label: "Experience", value: `${d.experience} yrs` },
    d.licence && { label: "Licence", value: d.licence },
    d.duty && { label: "Duty", value: d.duty },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="flex h-full w-full flex-col rounded-card bg-white p-5 shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-gradient">
          {d.photo ? (
            <Photo photo={d.photo} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center font-head text-xl font-semibold text-white">{initials(d.name)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 font-head text-lg font-semibold text-ink-900">
            <span className="truncate">{d.name}</span>
            {d.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-brand-500" aria-label="Documents verified" />}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
            {d.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[d.area, d.location].filter(Boolean).join(", ")}</span>}
            {d.sample && <span className="rounded-full bg-taxi/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-800">Sample profile</span>}
          </p>
        </div>
      </div>

      {stats.length > 0 && (
        <dl className="mt-4 grid min-h-[84px] grid-cols-3 items-center divide-x divide-line rounded-2xl bg-surface-50 py-3 text-center">
          {stats.map((s) => (
            <div key={s.label} className="px-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{s.label}</dt>
              <dd className={`mt-1 font-semibold leading-tight text-ink-900 ${s.label === "Experience" ? "font-head text-xl text-brand-600" : "text-[13px]"}`}>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {d.drives.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Drives</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {d.drives.map((x) => <li key={x} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">{x}</li>)}
          </ul>
        </div>
      )}
      {d.languages.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-600"><Languages className="h-4 w-4 shrink-0 text-ink-400" />{d.languages.join(", ")}</p>
      )}
      {d.about && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{d.about}</p>}

      <div className="mt-auto pt-5">
        <RequestButton title={title} entries={[{ label: "Requested driver", value: d.name }, ...entries]} label={requestLabel} className="w-full" />
      </div>
    </article>
  );
}
