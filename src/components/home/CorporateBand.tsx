import RequestForm from "../RequestForm";
import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";
import type { HomeContent } from "@/content/defaults";

export default function CorporateBand({ id = "corporate-enquiry", content: c }: { id?: string; content: HomeContent["corporate"] }) {
  return (
    <section id={id} className="section-y scroll-mt-24 bg-surface-50" aria-labelledby={`${id}-title`}>
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionTitle id={`${id}-title`}>{accent(c.title)}</SectionTitle>
          <p className="lead mt-4">{c.text}</p>
          <ul className="mt-8 space-y-3 text-ink-900">
            {c.points.map((t) => (
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
