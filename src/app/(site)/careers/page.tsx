import PageHero from "@/components/PageHero";
import RequestForm from "@/components/RequestForm";
import { accent } from "@/components/Accent";
import { getCareerRoles, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("careers");

export default async function CareersPage() {
  const [p, roles] = await Promise.all([getPage("careers"), getCareerRoles()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} bgPhoto={p.image} bgPhotoMobile={p.imageMobile} bgFit={p.imageFit} art="truck" color="#F47A16" />
      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="h2">{accent(p.rolesTitle)}</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {roles.map((r) => (
                <li key={r.role} className="py-5"><h3 className="font-head text-lg font-semibold">{r.role}</h3><p className="mt-1">{r.detail}</p></li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-400">{p.note}</p>
          </div>
          <div className="rounded-card bg-surface-50 p-6 sm:p-8">
            <h2 className="font-head text-2xl font-semibold">{p.formTitle}</h2>
            <p className="mb-6 mt-2 text-sm">{p.formText}</p>
            <RequestForm formKey="careers" compact override={p.form} />
          </div>
        </div>
      </section>
    </>
  );
}
