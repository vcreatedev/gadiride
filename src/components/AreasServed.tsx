import { BadgeIndianRupee, Gauge, LifeBuoy, MapPin, Phone, Truck } from "lucide-react";
import { accent } from "./Accent";
import { telHref } from "@/config/site";

const ICONS = [BadgeIndianRupee, Gauge, Truck, LifeBuoy];

/** "Self drive cars across Hyderabad": highlights, the areas we cover, and the phone number. */
export default function AreasServed({
  title,
  text,
  areas,
  highlights,
  phone,
}: {
  title: string;
  text: string;
  areas: string[];
  highlights: { title: string; text: string }[];
  phone?: string;
}) {
  if (!areas.length && !highlights.length) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="areas-title">
      <div className="container-x grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <h2 id="areas-title" className="h2">{accent(title)}</h2>
          {text && <p className="lead mt-4 text-ink-600">{text}</p>}
          {highlights.length > 0 && (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((h, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <li key={h.title} className="rounded-card bg-surface-50 p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white"><Icon className="h-5 w-5" /></span>
                    <h3 className="mt-3 font-head text-lg font-semibold text-ink-900">{h.title}</h3>
                    {h.text && <p className="mt-1 text-sm text-ink-600">{h.text}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="self-start rounded-card bg-ink-900 p-6 text-white md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">Pickup and delivery areas</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {areas.map((a) => (
              <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-sm text-white/90 ring-1 ring-white/10">
                <MapPin className="h-3.5 w-3.5 text-brand-400" />{a}
              </li>
            ))}
          </ul>
          {phone && (
            <a href={telHref(phone)} className="mt-8 flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-gradient"><Phone className="h-5 w-5" /></span>
              <span>
                <span className="block text-sm text-ink-300">For booking help, call</span>
                <span className="block font-head text-2xl font-semibold tracking-wide">{phone}</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
