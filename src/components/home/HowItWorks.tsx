import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";
import type { HomeContent } from "@/content/defaults";

export default function HowItWorks({ content: c }: { content: HomeContent["how"] }) {
  return (
    <section className="section-y bg-surface-50" aria-labelledby="how-title">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionTitle id="how-title">{accent(c.title)}</SectionTitle>
          <p className="lead mt-4">{c.text}</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {c.steps.map((s, i) => (
            <li key={s.title} className="group relative overflow-hidden rounded-card bg-white p-6 shadow-card transition-transform duration-300 hover:-translate-y-1">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="text-gradient font-display text-5xl font-extrabold">{i + 1}</span>
              <h3 className="mt-4 font-head text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
