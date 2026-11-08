import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import VehicleGallery from "@/components/VehicleGallery";
import RequestForm from "@/components/RequestForm";
import BookActions from "@/components/BookActions";
import { FORMS } from "@/data/forms";
import { getPage, getSettings, getVehicle, getVehicles } from "@/lib/content";

/** Pre-render known vehicles; vehicles added later in the admin render on first visit. */
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getVehicles()).map((v) => ({ slug: v.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: key } = await params;
  const v = await getVehicle(key);
  if (!v) return {};
  const img = v.photo.src.startsWith("https://cdn.sanity.io/") ? `${v.photo.src}${v.photo.src.includes("?") ? "&" : "?"}w=1200&h=630&fit=fill&bg=ffffff&auto=format` : v.photo.src;
  return { title: v.name, description: v.summary, openGraph: { images: [img] } };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: key } = await params;
  const [all, site, p] = await Promise.all([getVehicles(), getSettings(), getPage("vehicles")]);
  const v = all.find((x) => x.slug === key);
  if (!v) notFound();
  const similar = all.filter((x) => x.group === v.group && x.slug !== v.slug).slice(0, 3);
  return (
    <>
      {/* Space for the fixed header: 60px on phones, 72px from md up. */}
      <div className={`pt-[60px] md:pt-[72px] ${site.heroTheme === "dark" ? "bg-ink-900" : "bg-surface-50"}`} />
      <section className="bg-surface-50 pb-16 pt-3 md:pb-24 md:pt-6">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm font-semibold text-ink-900">
            <Link href={`/vehicles/${v.group}/`} className="inline-flex items-center gap-1 hover:text-brand-600">
              <ChevronLeft className="h-4 w-4" />
              {v.groupName}
            </Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-400">{v.typeName}</span>
          </nav>
          {/* minmax(0,…) and min-w-0: a long thumbnail row scrolls inside its strip instead of widening the page. */}
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-8 md:mt-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0 lg:sticky lg:top-24">
              <VehicleGallery v={v} />
              {!v.ownPhoto && <p className="mt-3 text-xs text-ink-400">{p.stockPhotoNote}</p>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">{v.groupName}</p>
              <h1 className="display mt-1 text-5xl md:text-6xl">{v.name}</h1>
              <p className="mt-4 leading-relaxed">{v.summary}</p>
              {v.specs.length > 0 && (
                <dl className={`mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-field border border-line bg-line ${v.specs.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
                  {v.specs.map((s) => (
                    <div key={s.label} className="bg-white px-4 py-3">
                      <dt className="text-xs text-ink-400">{s.label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink-900">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {v.options.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {v.options.map((o) => (
                    <li key={o} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800">
                      <Check className="h-4 w-4" />{o}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 rounded-card bg-white p-5 shadow-card">
                <p className="font-head text-3xl font-semibold text-ink-900">
                  {site.showPrices && v.pricePerDay ? (
                    <>₹{v.pricePerDay.toLocaleString("en-IN")}<span className="text-base font-medium text-ink-600"> per day</span></>
                  ) : (
                    <span className="text-2xl">Price on request</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-400">Book instantly on WhatsApp or call our team.</p>
                <BookActions title={FORMS[v.group].title} vehicle={v.name} details={v} showPrice={site.showPrices} size="lg" className="mt-4" />
              </div>
              <div className="mt-6 rounded-card bg-white p-6 shadow-card">
                <h2 className="font-head text-xl font-semibold">{p.detailQuoteTitle}</h2>
                <p className="mb-6 mt-1 text-sm text-ink-400">{p.detailQuoteText}</p>
                <RequestForm
                  formKey={v.group}
                  idPrefix={`page-${v.slug}`}
                  // The vehicle is already chosen, so no type picker; chauffeur-only cars start on "With driver".
                  hide={["carType", "vehicle", "machine"]}
                  preset={v.group === "cars" && !v.options.some((o) => /self/i.test(o)) ? { values: { mode: "With driver" }, nonce: 1 } : undefined}
                  extra={[{ label: "Requested model", value: v.name }]}
                  compact
                />
              </div>
            </div>
          </div>

          {similar.length > 0 && (
            <div className="mt-20 border-t border-line pt-14">
              <h2 className="font-head text-2xl font-semibold">More {v.groupName.toLowerCase()}</h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <li key={s.slug} className="flex h-full">
                    <VehicleCard v={s} showPrices={site.showPrices} />
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
