import PageHero from "@/components/PageHero";
import CorporateBand from "@/components/home/CorporateBand";
import CategoryIcon from "@/components/CategoryIcon";
import { accent } from "@/components/Accent";
import { getGroups, getHome, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("corporate");

export default async function CorporatePage() {
  const [p, home, groups] = await Promise.all([getPage("corporate"), getHome(), getGroups()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} art="suv" color="#2E2E34" />
      <section className="section-y bg-white">
        <div className="container-x">
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {p.uses.map((u) => (
              <li key={u.title} className="rounded-card bg-surface-50 p-7 transition-colors hover:bg-brand-50">
                <h2 className="font-head text-xl font-semibold">{u.title}</h2>
                <p className="mt-3 text-sm leading-relaxed">{u.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink-900">{p.groupsLabel}</span>
            {groups.map((g) => <span key={g.id} className="chip"><CategoryIcon id={g.id} className="h-4 w-5" />{g.name}</span>)}
          </div>
        </div>
      </section>
      <CorporateBand id="corporate-form" content={home.corporate} />
    </>
  );
}
