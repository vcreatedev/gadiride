import Link from "next/link";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import { accent } from "@/components/Accent";
import { getGroups, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("about");

export default async function AboutPage() {
  const [p, groups] = await Promise.all([getPage("about"), getGroups()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} art="van" color="#E9EBEF" />
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
            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {groups.map((g) => <li key={g.id}><Link href={`/vehicles/${g.id}/`} className="link">{g.name}</Link></li>)}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
