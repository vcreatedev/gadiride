import Link from "next/link";
import SectionTitle from "../SectionTitle";
import Photo from "../Photo";
import { accent } from "../Accent";
import type { HomeContent } from "@/content/defaults";
import type { ServiceItem } from "@/lib/content";

/** Editorial service cards. Text and photos come from the admin. */
export default function ServicesGrid({ content: c, services }: { content: HomeContent["services"]; services: ServiceItem[] }) {
  if (!services.length) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="services-title">
      <div className="container-x">
        <SectionTitle id="services-title" className="max-w-[16ch]">{accent(c.title)}</SectionTitle>
        <p className="lead mt-4">{c.text}</p>
        <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const dark = i % 3 === 1;
            return (
              <li key={s.id}>
                <Link href={`/services/#${s.id}`} className="group block">
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-card ${dark ? "bg-gradient-to-b from-ink-700 to-ink-800" : "bg-gradient-to-b from-white to-[#f3efe9]"}`}>
                    <Photo
                      photo={s.photo}
                      alt={s.name}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 font-head text-2xl font-semibold transition-colors group-hover:text-brand-600">{s.name}</h3>
                  {s.forWho && <p className="mt-1 text-sm text-ink-400">{s.forWho}</p>}
                  <p className="mt-3 text-ink-600">{s.offer}</p>
                  <span className="link mt-4 inline-block">{c.linkLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
