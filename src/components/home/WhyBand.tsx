import VehicleSvg from "../VehicleSvg";
import WhatsAppIcon from "../WhatsAppIcon";
import { Layers, KeyRound, Briefcase, Sparkles } from "lucide-react";
import type { HomeContent } from "@/content/defaults";

const ICONS = [Layers, WhatsAppIcon, KeyRound, Briefcase];

export default function WhyBand({ content: c }: { content: HomeContent["why"] }) {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 md:py-28" aria-labelledby="why-title">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <VehicleSvg art="suv" color="#9ea3aa" className="absolute -right-[10%] bottom-[-8%] w-[95%] opacity-30 grayscale md:w-[75%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/30" />
      </div>
      <div className="container-x relative">
        <ul data-lenis-prevent className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          <li className="flex w-[78vw] shrink-0 snap-start items-end rounded-card bg-ink-800 p-7 sm:w-[340px] lg:w-auto">
            <h2 id="why-title" className="display text-[2.6rem] leading-[0.95] md:text-5xl">
              <span className="text-gradient block">{c.titleTop}</span>
              <span className="block text-white">{c.titleBottom}</span>
            </h2>
          </li>
          {c.items.map((r, i) => {
            const Icon = ICONS[i] ?? Sparkles;
            return (
              <li key={r.title} className="group flex w-[78vw] shrink-0 snap-start flex-col rounded-card bg-ink-800/90 p-7 backdrop-blur transition-colors hover:bg-ink-700 sm:w-[300px] lg:w-auto">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-brand-300 ring-1 ring-white/10 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="display mt-12 text-2xl text-white">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">{r.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
