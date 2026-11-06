import Link from "next/link";
import type { HomeContent } from "@/content/defaults";

export default function CareersTeaser({ content: c }: { content: HomeContent["careers"] }) {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="careers-teaser">
      <div className="container-x">
        <div className="relative flex flex-col gap-8 overflow-hidden rounded-card border border-line p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <span aria-hidden className="checker absolute right-0 top-0 h-4 w-24 opacity-80" />
          <div>
            <h2 id="careers-teaser" className="font-head text-3xl font-semibold">{c.title}</h2>
            <p className="mt-2 max-w-[52ch]">{c.text}</p>
          </div>
          <Link href="/careers/" className="btn bg-ink-900 text-white hover:bg-ink-700">{c.cta}</Link>
        </div>
      </div>
    </section>
  );
}
