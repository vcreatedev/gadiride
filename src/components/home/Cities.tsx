import { site } from "@/config/site";
import SectionTitle from "../SectionTitle";

/** Hidden until the client confirms the cities they serve. */
export default function Cities() {
  if (!site.cities.length) return null;
  return (
    <section className="section-y bg-white" aria-labelledby="cities-title">
      <div className="container-x">
        <SectionTitle id="cities-title">Cities we serve<span className="text-brand-500">.</span></SectionTitle>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.cities.map((c) => (
            <li key={c.name} className="rounded-card bg-surface-50 p-6">
              <h3 className="font-head text-xl font-bold">{c.name}</h3>
              {c.note && <p className="mt-2 text-sm">{c.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
