import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { VEHICLES, groupOf } from "@/data/vehicles";
import VehicleSvg from "@/components/VehicleSvg";
import VehicleCard from "@/components/VehicleCard";
import RequestForm from "@/components/RequestForm";
import { site } from "@/config/site";

export const dynamicParams = false;
export function generateStaticParams() { return VEHICLES.map((v) => ({ slug: v.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: key } = await params;
  const v = VEHICLES.find((x) => x.slug === key);
  return { title: v?.name, description: v?.summary };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: key } = await params;
  const v = VEHICLES.find((x) => x.slug === key);
  if (!v) notFound();
  const g = groupOf(v.group);
  const similar = VEHICLES.filter((x) => x.group === v.group && x.slug !== v.slug).slice(0, 3);
  return (
    <>
      <div className="bg-ink-900 pt-[72px]" />
      <section className="bg-surface-50 pb-16 pt-8 md:pb-24">
        <div className="container-x">
          <Link href={`/vehicles/${g.id}/`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 hover:text-brand-600"><ChevronLeft className="h-4 w-4" />{g.name}</Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div>
              <div className="grid aspect-[16/10] place-items-center rounded-card bg-[linear-gradient(180deg,#ffffff,#E9EBEF)] px-[8%]">
                <VehicleSvg art={v.art} color={v.color} title={`${v.name}, side view`} className="w-full" />
              </div>
              <div className="mt-4 grid aspect-[16/6] place-items-center rounded-card bg-[#07080a] px-[10%]">
                <VehicleSvg art={v.art} mode="line" className="w-full max-h-[85%]" />
              </div>
              <p className="mt-3 text-xs text-ink-400">Illustrations. Photos of the actual vehicle are shared with your quote.</p>
            </div>
            <div className="lg:sticky lg:top-24">
              <p className="text-sm text-ink-400">{g.name}</p>
              <h1 className="display mt-1 text-5xl md:text-6xl">{v.name}</h1>
              <p className="mt-4 leading-relaxed">{v.summary}</p>
              <dl className="mt-6 divide-y divide-line rounded-field border border-line bg-white">
                {v.specs.map((s) => (
                  <div key={s.label} className="flex justify-between px-4 py-3 text-sm"><dt className="text-ink-600">{s.label}</dt><dd className="font-semibold text-ink-900">{s.value}</dd></div>
                ))}
                <div className="flex justify-between px-4 py-3 text-sm"><dt className="text-ink-600">Options</dt><dd className="text-right font-semibold text-ink-900">{v.options.join(", ")}</dd></div>
              </dl>
              <p className="mt-6 font-head text-2xl font-extrabold text-ink-900">{site.showPrices && v.pricePerDay ? `from ₹${v.pricePerDay.toLocaleString("en-IN")} per day` : "Price on request"}</p>
              <div className="mt-6 rounded-card bg-white p-5 shadow-card sm:p-6">
                <RequestForm formKey={v.group} idPrefix={`veh-${v.slug}`} extra={[{ label: "Vehicle", value: v.name }]} compact />
              </div>
            </div>
          </div>
        </div>
      </section>
      {similar.length > 0 && (
        <section className="section-y bg-white">
          <div className="container-x">
            <h2 className="h2">Similar vehicles<span className="text-brand-500">.</span></h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <li key={s.slug}><VehicleCard v={s} /></li>)}</ul>
          </div>
        </section>
      )}
    </>
  );
}
