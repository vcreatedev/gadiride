import { BadgeCheck, MapPin, Languages } from "lucide-react";
import Photo from "../Photo";
import RequestButton from "./RequestButton";
import type { Driver } from "@/lib/content";
import type { Entry } from "@/lib/whatsapp";

export default function DriverCard({ d, title, entries, requestLabel }: { d: Driver; title: string; entries: Entry[]; requestLabel: string }) {
  return (
    <article className="flex h-full flex-col rounded-card bg-white p-5 shadow-card ring-1 ring-black/5">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-gradient">
          {d.photo ? (
            <Photo photo={d.photo} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center font-head text-2xl font-semibold text-white">{d.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-head text-lg font-semibold text-ink-900">
            <span className="truncate">{d.name}</span>
            {d.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-brand-500" aria-label="Documents verified" />}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-400">
            {d.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{d.city}</span>}
            {typeof d.experience === "number" && <span>{d.experience} yrs experience</span>}
          </p>
        </div>
      </div>
      {d.drives.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {d.drives.map((x) => <li key={x} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">{x}</li>)}
        </ul>
      )}
      {d.languages.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-600"><Languages className="h-4 w-4 text-ink-400" />{d.languages.join(", ")}</p>
      )}
      {d.about && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{d.about}</p>}
      <div className="mt-auto pt-5">
        <RequestButton title={title} entries={[{ label: "Requested driver", value: d.name }, ...entries]} label={requestLabel} className="w-full" />
      </div>
    </article>
  );
}
