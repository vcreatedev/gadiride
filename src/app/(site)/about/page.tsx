import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import { accent } from "@/components/Accent";
import { getGroups, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("about");

export default async function AboutPage() {
  const [p, groups] = await Promise.all([getPage("about"), getGroups()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} bgPhoto={p.heroImage} bgPhotoMobile={p.heroImageMobile} bgFit={p.heroFit} art="van" color="#E9EBEF" />
      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="h2">{accent(p.heading)}</h2>
            {p.image && (
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-card">
                <Photo photo={p.image} fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
              </div>
            )}
          </div>
          <div className="space-y-5 text-lg leading-relaxed">
            {p.paragraphs.map((t) => <p key={t.slice(0, 24)}>{t}</p>)}
            {/* The four services, as cards (names and descriptions come from each service's admin page). */}
            <div className="pt-4">
              {p.linksTitle && <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-brand-600">{p.linksTitle}</p>}
              <ul className="grid gap-3 sm:grid-cols-2">
                {groups.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/vehicles/${g.id}/`}
                      className="group flex h-full items-start gap-4 rounded-card bg-surface-50 p-5 ring-1 ring-line transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lift hover:ring-brand-200"
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-gradient group-hover:text-white">
                        <CategoryIcon id={g.id} className="h-6 w-8" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-head text-lg font-semibold text-ink-900">
                          {g.name}
                          <ArrowRight className="h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-1" />
                        </span>
                        {g.blurb && <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-600">{g.blurb}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
