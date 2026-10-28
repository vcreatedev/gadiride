import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CorporateBand from "@/components/home/CorporateBand";
import { GROUPS } from "@/data/vehicles";
import CategoryIcon from "@/components/CategoryIcon";

export const metadata: Metadata = { title: "Corporate transport and fleet", description: "Staff transport, guest cars, long-term fleet, goods transport and machinery for companies." };

const USES = [
  { t: "Staff transport", d: "Daily pickup and drop with tempo travellers and buses." },
  { t: "Guest and executive cars", d: "Sedans, SUVs and luxury cars with drivers for visitors and leadership." },
  { t: "Long-term vehicles", d: "Monthly and longer arrangements for teams that need cars on hand." },
  { t: "Operations", d: "Trucks for goods and backhoe loaders for project sites." },
];

export default function CorporatePage() {
  return (
    <>
      <PageHero title={<>Corporate transport<span className="text-brand-500">.</span></>} intro="One partner for people, goods and machinery. Tell us what your company needs." art="suv" color="#2B2D31" />
      <section className="section-y bg-white">
        <div className="container-x">
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {USES.map((u) => (
              <li key={u.t} className="rounded-card bg-surface-50 p-7"><h2 className="font-head text-xl font-bold">{u.t}</h2><p className="mt-3 text-sm leading-relaxed">{u.d}</p></li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink-900">Across every group:</span>
            {GROUPS.map((g) => <span key={g.id} className="chip"><CategoryIcon id={g.id} className="h-4 w-5" />{g.name}</span>)}
          </div>
        </div>
      </section>
      <CorporateBand id="corporate-form" />
    </>
  );
}
