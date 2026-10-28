import RequestForm from "../RequestForm";
import SectionTitle from "../SectionTitle";

export default function CorporateBand({ id = "corporate-enquiry" }: { id?: string }) {
  return (
    <section id={id} className="section-y scroll-mt-24 bg-surface-50" aria-labelledby={`${id}-title`}>
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionTitle id={`${id}-title`}>Moving a team or a fleet<span className="text-brand-500">?</span></SectionTitle>
          <p className="lead mt-4">Staff transport, guest cars, long-term vehicles, goods and machinery. Tell us what your company needs and we will put together one plan.</p>
          <ul className="mt-8 space-y-3 text-ink-900">
            {["Monthly and long-term arrangements", "Mixed vehicles across all groups", "One contact for every request"].map((t) => (
              <li key={t} className="flex items-center gap-3 font-medium"><span className="h-2 w-2 rounded-full bg-brand-500" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-card bg-white p-6 shadow-card sm:p-8">
          <RequestForm formKey="corporate" idPrefix={id} compact />
        </div>
      </div>
    </section>
  );
}
