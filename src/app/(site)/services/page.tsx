import PageHero from "@/components/PageHero";
import ExpandForm from "@/components/ExpandForm";
import Photo from "@/components/Photo";
import { accent } from "@/components/Accent";
import { getPage, getServices, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("services");

export default async function ServicesPage() {
  const [p, services] = await Promise.all([getPage("services"), getServices()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} art="bus" color="#F4F5F7" />
      {services.map((s, i) => {
        const dark = i % 2 === 1;
        return (
          <section
            key={s.id}
            id={s.id}
            className={`scroll-mt-20 py-16 md:py-24 ${dark ? "bg-ink-900 text-ink-300" : i % 4 === 0 ? "bg-white" : "bg-surface-50"}`}
            aria-labelledby={`${s.id}-h`}
          >
            <div className="container-x grid items-center gap-10 lg:grid-cols-2">
              <div className={i % 2 ? "lg:order-2" : ""}>
                {s.forWho && <p className={`text-sm font-medium ${dark ? "text-brand-400" : "text-brand-700"}`}>For {s.forWho.charAt(0).toLowerCase() + s.forWho.slice(1)}</p>}
                <h2 id={`${s.id}-h`} className={`display mt-2 text-5xl md:text-6xl ${dark ? "text-white" : ""}`}>{s.name}</h2>
                <p className="lead mt-4">{s.offer}</p>
                <ul className="mt-6 space-y-2">
                  {s.points.map((pt) => (
                    <li key={pt} className={`flex items-center gap-3 font-medium ${dark ? "text-white" : "text-ink-900"}`}>
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                      {pt}
                    </li>
                  ))}
                </ul>
                {s.toConfirm && <p className="mt-4 text-sm text-ink-400">{p.confirmNote}</p>}
                <ExpandForm formKey={s.form} label={s.cta} dark={dark} />
              </div>
              <div className={`relative aspect-[4/3] overflow-hidden rounded-card ${dark ? "bg-ink-800" : "bg-gradient-to-b from-white to-[#f3efe9]"} ${i % 2 ? "lg:order-1" : ""}`}>
                <Photo
                  photo={s.photo}
                  alt={s.name}
                  fill
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
