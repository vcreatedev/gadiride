import Link from "next/link";
import { SERVICES } from "@/data/services";
import SectionTitle from "../SectionTitle";

const ART_IMAGE_MAP: Record<string, string> = {
  hatch: "hatchback",
  sedan: "sedan",
  suv: "suv",
  pickup: "pickup",
  van: "tempo",
  truck: "truck",
  bus: "bus",
  jcb: "jcb",
};

/** Editorial service cards with realistic photography. */
export default function ServicesGrid() {
  return (
    <section className="section-y bg-white" aria-labelledby="services-title">
      <div className="container-x">
        <SectionTitle id="services-title" className="max-w-[16ch]">
          More than car rental<span className="text-brand-500">.</span>
        </SectionTitle>
        <p className="lead mt-4">Six ways we help, from a weekend car to a fleet for your company.</p>
        <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <li key={s.id}>
              <Link href={`/services/#${s.id}`} className="group block">
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card p-6 ${
                    i % 3 === 1
                      ? "bg-gradient-to-b from-[#2B2D31] to-[#1E1F22]"
                      : "bg-gradient-to-b from-[#F8F9FA] to-[#E9EBEF]"
                  }`}
                >
                  <img
                    src={`/vehicles/${ART_IMAGE_MAP[s.art] || "sedan"}.webp`}
                    alt={s.name}
                    className={`h-[82%] w-[92%] object-contain transition-transform duration-700 ease-out group-hover:scale-105 ${
                      i % 3 === 1 ? "brightness-95 drop-shadow-lg" : "mix-blend-multiply drop-shadow-md"
                    }`}
                    loading="lazy"
                  />
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
