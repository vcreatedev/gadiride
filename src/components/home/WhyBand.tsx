import VehicleSvg from "../VehicleSvg";
import WhatsAppIcon from "../WhatsAppIcon";
import { Layers, KeyRound, Briefcase } from "lucide-react";

const REASONS = [
  { icon: Layers, title: "Every vehicle, one place", text: "Cars, buses, trucks and JCBs from a single team, so you do not need four different contacts." },
  { icon: WhatsAppIcon, title: "Quotes on WhatsApp", text: "Send your details once. Our team replies on the app you already use." },
  { icon: KeyRound, title: "Drive or be driven", text: "Self drive for many cars, or add a driver or operator when you need one." },
  { icon: Briefcase, title: "Personal or business", text: "From a family weekend to daily staff transport and site work." },
];

export default function WhyBand() {
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
              <span className="block text-brand-500">Why rent with</span>
              <span className="block text-white">Gadiride</span>
            </h2>
          </li>
          {REASONS.map((r) => (
            <li key={r.title} className="flex w-[78vw] shrink-0 snap-start flex-col rounded-card bg-ink-800/90 p-7 backdrop-blur sm:w-[300px] lg:w-auto">
              <r.icon className="h-8 w-8 text-white" strokeWidth={1.6} />
              <h3 className="display mt-14 text-2xl text-white">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
