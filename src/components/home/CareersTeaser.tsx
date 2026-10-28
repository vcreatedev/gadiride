import Link from "next/link";
import { CAREER_ROLES } from "@/data/services";

export default function CareersTeaser() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="careers-teaser">
      <div className="container-x flex flex-col gap-8 rounded-card border border-line p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 id="careers-teaser" className="font-head text-3xl font-bold">Drive with us</h2>
          <p className="mt-2 max-w-[52ch]">We work with {CAREER_ROLES.map((r) => r.role.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}.</p>
        </div>
        <Link href="/careers/" className="btn bg-ink-900 text-white hover:bg-ink-700">See careers</Link>
      </div>
    </section>
  );
}
