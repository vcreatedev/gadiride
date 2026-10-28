import Link from "next/link";
import { SERVICES } from "@/data/services";
import VehicleSvg from "../VehicleSvg";
import SectionTitle from "../SectionTitle";

/** Editorial service cards. Image wells are illustrated until lifestyle photography is supplied. */
export default function ServicesGrid() {
  return (
    <section className="section-y bg-white" aria-labelledby="services-title">
      <div className="container-x">
        <SectionTitle id="services-title" className="max-w-[16ch]">More than car rental<span className="text-brand-500">.</span></SectionTitle>
        <p className="lead mt-4">Six ways we help, from a weekend car to a fleet for your company.</p>
        <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <li key={s.id}>
              <Link href={`/services/#${s.id}`} className="group block">
                <div className={`relative grid aspect-[4/3] place-items-end overflow-hidden rounded-card ${i % 3 === 1 ? "bg-ink-800" : "bg-[linear-gradient(160deg,#E9EBEF,#C9CDD3)]"}`}>
                  <div aria-hidden className={`absolute inset-0 ${i % 3 === 1 ? "bg-[radial-gradient(70%_60%_at_70%_80%,rgba(242,97,29,.25),transparent)]" : "bg-[radial-gradient(70%_60%_at_30%_90%,rgba(255,255,255,.8),transparent)]"}`} />
                  <VehicleSvg art={s.art} color={s.color} className="relative mb-[8%] w-[78%] translate-x-[6%] grayscale-[35%] transition-transform duration-700 ease-out group-hover:translate-x-[10%]" />
                </div>
                <h3 className="mt-5 font-head text-2xl font-bold">{s.name}</h3>
                <p className="mt-1 text-sm text-ink-400">{s.forWho}</p>
                <p className="mt-3 text-ink-600">{s.offer}</p>
                <span className="link mt-4 inline-block">Learn more</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
