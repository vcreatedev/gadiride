import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { VEHICLES, groupOf } from "@/data/vehicles";
import VehicleCard from "@/components/VehicleCard";
import RequestForm from "@/components/RequestForm";
import { site } from "@/config/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return VEHICLES.map((v) => ({ slug: v.slug }));
}
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
          <Link
            href={`/vehicles/${g.id}/`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 hover:text-brand-600"
          >
            <ChevronLeft className="h-4 w-4" />
            {g.name}
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div>
              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-card bg-gradient-to-b from-[#ffffff] to-[#E9EBEF] p-8 shadow-card">
                <img
                  src={`/vehicles/${v.type}.webp`}
                  alt={v.name}
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
                />
              </div>
              <p className="mt-3 text-xs text-ink-400">
                Representative vehicle from our fleet. Exact model, make and details confirmed with your quote.
              </p>
            </div>
            <div className="lg:sticky lg:top-24">
              <p className="text-sm text-ink-400">{g.name}</p>
              <h1 className="display mt-1 text-5xl md:text-6xl">{v.name}</h1>
              <p className="mt-4 leading-relaxed">{v.summary}</p>
              <dl className="mt-6 divide-y divide-line rounded-field border border-line bg-white">
                {v.specs.map((s) => (
                  <div key={s.label} className="flex justify-between px-4 py-3 text-sm">
                    <dt className="text-ink-600">{s.label}</dt>
                    <dd className="font-semibold text-ink-900">{s.value}</dd>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 text-sm">
                  <dt className="text-ink-600">Options</dt>
                  <dd className="text-right font-semibold text-ink-900">{v.options.join(", ")}</dd>
                </div>
              </dl>
              {site.showPrices && v.pricePerDay && (
                <p className="mt-6 font-head text-3xl font-extrabold text-ink-900">
                  from ₹{v.pricePerDay.toLocaleString("en-IN")}
                  <span className="text-base font-semibold text-ink-600"> per day</span>
                </p>
              )}
              <div className="mt-6 rounded-card bg-white p-6 shadow-card">
                <h2 className="font-head text-xl font-bold">Request a quote</h2>
                <p className="mb-6 mt-1 text-sm text-ink-400">
                  We verify availability for your dates and reply on WhatsApp.
                </p>
                <RequestForm
                  formKey={g.id}
                  idPrefix={`page-${v.slug}`}
                  preset={{ values: { vehicle: v.name, carType: v.name.split(" ")[0] }, nonce: 1 }}
                  extra={[{ label: "Requested model", value: v.name }]}
                  compact
                />
              </div>
            </div>
          </div>

          {similar.length > 0 && (
            <div className="mt-20 border-t border-line pt-14">
              <h2 className="font-head text-2xl font-bold">More {g.name.toLowerCase()}</h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <li key={s.slug} className="flex h-full">
                    <VehicleCard v={s} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
