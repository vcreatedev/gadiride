import { MapPin } from "lucide-react";
import SectionTitle from "../SectionTitle";
import { accent } from "../Accent";

/** Hidden until cities are added in Site settings. */
export default function Cities({ title, cities }: { title: string; cities: { name: string; note?: string }[] }) {
  if (!cities.length) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="cities-title">
      <div className="container-x">
        <SectionTitle id="cities-title">{accent(title)}</SectionTitle>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => (
            <li key={c.name} className="rounded-card bg-surface-50 p-6 transition-colors hover:bg-brand-50">
              <MapPin className="h-5 w-5 text-brand-500" />
              <h3 className="mt-3 font-head text-xl font-semibold">{c.name}</h3>
              {c.note && <p className="mt-2 text-sm">{c.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
