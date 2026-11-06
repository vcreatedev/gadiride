import Link from "next/link";
import NotFoundScene from "@/components/NotFoundScene";
import SiteShell from "@/components/SiteShell";
import { accent } from "@/components/Accent";
import { getPage, getSettings } from "@/lib/content";

export default async function NotFound() {
  const [p, s] = await Promise.all([getPage("notFound"), getSettings()]);
  const dark = s.heroTheme === "dark";
  return (
    <SiteShell>
      <section className={`flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-32 text-center ${dark ? "bg-ink-900 text-white" : "bg-[linear-gradient(180deg,#FFF4E6_0%,#FFFFFF_70%)] text-ink-900"}`}>
        <div className="container-x">
          <p className="font-mono text-sm text-brand-400">Error 404</p>
          <h1 className={`display mx-auto mt-3 max-w-[14ch] text-6xl md:text-8xl ${dark ? "text-white" : "text-ink-900"}`}>{accent(p.title)}</h1>
          <p className={`lead mx-auto mt-4 ${dark ? "text-ink-300" : "text-ink-600"}`}>{p.text}</p>
          <Link href="/vehicles/cars/" className="btn-primary mt-8">{p.cta}</Link>
          <NotFoundScene />
        </div>
      </section>
    </SiteShell>
  );
}
