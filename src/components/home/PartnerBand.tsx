import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { accent } from "../Accent";
import type { HomeContent } from "@/content/defaults";

/** Invites vehicle owners to attach their car, bus, truck or machine. */
export default function PartnerBand({ content: c }: { content: HomeContent["partner"] }) {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="partner-band">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-card bg-ink-900 p-8 md:flex md:items-center md:justify-between md:gap-10 md:p-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_100%_0%,rgba(244,122,22,0.35),transparent_60%)]" />
          <span aria-hidden className="checker absolute bottom-0 left-0 h-4 w-28 opacity-30 invert" />
          <div className="relative">
            <h2 id="partner-band" className="display text-4xl text-white md:text-5xl">{accent(c.title)}</h2>
            <p className="mt-3 max-w-[56ch] text-ink-300">{c.text}</p>
          </div>
          <Link href="/partner/" className="btn-primary relative mt-6 shrink-0 md:mt-0">
            {c.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
