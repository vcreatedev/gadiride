import PageHero from "@/components/PageHero";
import RequestForm from "@/components/RequestForm";
import { accent } from "@/components/Accent";
import { getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("partner");

export default async function PartnerPage() {
  const p = await getPage("partner");
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} bgPhoto={p.image} bgPhotoMobile={p.imageMobile} bgFit={p.imageFit} art="van" color="#F47A16" />
      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <ol className="space-y-4">
            {p.steps.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-card bg-surface-50 p-6">
                <span className="text-gradient font-display text-5xl font-extrabold leading-none">{i + 1}</span>
                <div>
                  <h2 className="font-head text-xl font-semibold text-ink-900">{s.title}</h2>
                  <p className="mt-1.5 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
            <h2 className="font-head text-2xl font-semibold">{p.formTitle}</h2>
            <p className="mb-6 mt-2 text-sm text-ink-600">{p.formText}</p>
            <RequestForm formKey="partner" compact />
          </div>
        </div>
      </section>
    </>
  );
}
