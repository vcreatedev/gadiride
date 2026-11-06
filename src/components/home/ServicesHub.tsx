import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import VehicleSvg from "../VehicleSvg";
import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";
import type { ArtId } from "@/data/vehicleArt";

type Item = { title: string; text: string; tag: string; href: string; art: string; color: string };

/** Card colours cycle through the logo palette: orange, dark, yellow. */
const TONES = [
  { card: "bg-brand-gradient text-white", title: "text-white", text: "text-white/85", tag: "bg-white/20 text-white", arrow: "bg-white text-ink-900" },
  { card: "bg-ink-900 text-white", title: "text-white", text: "text-ink-300", tag: "bg-brand-500/20 text-brand-300", arrow: "bg-brand-gradient text-white" },
  { card: "bg-taxi text-ink-900", title: "text-ink-900", text: "text-ink-800", tag: "bg-ink-900 text-taxi", arrow: "bg-ink-900 text-white" },
];

/** Bento overview of every service: a big card for cars, then the rest. */
export default function ServicesHub({ content }: { content: { title: string; text: string; items: Item[] } }) {
  if (!content.items.length) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="hub-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle id="hub-title">{accent(content.title)}</SectionTitle>
          {content.text && <p className="max-w-[46ch] text-ink-600">{content.text}</p>}
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((it, n) => {
            const t = TONES[n % TONES.length];
            const big = n === 0;
            return (
              <li key={it.title} className={big ? "sm:col-span-2 lg:row-span-2" : ""}>
                <Link
                  href={it.href}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-card p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7 ${big ? "min-h-[300px]" : "min-h-[230px]"} ${t.card}`}
                >
                  <span className={`self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${t.tag}`}>{it.tag}</span>
                  <h3 className={`mt-3 font-head font-semibold leading-tight ${big ? "text-3xl md:text-4xl" : "text-2xl"} ${t.title}`}>{it.title}</h3>
                  <p className={`mt-2 max-w-[34ch] text-[15px] ${t.text}`}>{it.text}</p>
                  <div className="relative mt-auto flex items-end justify-between pt-6">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-110 ${t.arrow}`} aria-hidden>
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                    <VehicleSvg
                      art={it.art as ArtId}
                      color={it.color}
                      className={`pointer-events-none drop-shadow-[0_10px_12px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:-translate-x-2 ${big ? "w-[62%] max-w-[420px]" : "w-[52%] max-w-[190px]"}`}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
