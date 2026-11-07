import Link from "next/link";
import { telHref } from "@/config/site";
import type { Group } from "@/data/vehicles";
import type { ServiceItem, Settings } from "@/lib/content";
import Photo from "./Photo";

export default function Footer({ settings: site, groups, services }: { settings: Settings; groups: Group[]; services: ServiceItem[] }) {
  // Columns from Site settings; with none set, list the vehicle groups and services from the catalogue.
  const columns = site.footerColumns.length
    ? site.footerColumns
    : [
        { title: "Vehicles", links: groups.map((g) => ({ href: `/vehicles/${g.id}/`, label: g.name })) },
        { title: "Services", links: services.map((s) => ({ href: `/services/#${s.id}`, label: s.name })) },
      ];
  const logo = site.logo ?? { src: "/brand/gadiride-logo.webp", alt: "Gadiride", width: 1248, height: 518 };
  return (
    <footer className="bg-ink-900 pb-24 pt-16 text-ink-300 md:pb-12">
      <div className="container-x">
        <div style={{ ["--cols" as string]: columns.length + 1 }} className="grid gap-12 lg:grid-cols-[1.3fr_repeat(var(--cols),1fr)]">
          <div>
            <Link href="/" aria-label="Gadiride home" className="inline-block rounded-2xl bg-white px-4 py-3 shadow-lift">
              <Photo photo={logo} alt={logo.alt ?? "Gadiride"} sizes="200px" className="h-16 w-auto" />
            </Link>
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed">{site.tagline} {site.footerBlurb}</p>
          </div>
          {columns.map((c) => <FooterCol key={c.title} title={c.title} links={c.links} />)}
          <div>
            <h2 className="text-sm font-semibold text-white">{site.footerContactTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {site.footerContactLink && <li><Link href="/contact/" className="hover:text-white">{site.footerContactLink}</Link></li>}
              {site.phone && <li><a href={telHref(site.phone)} className="hover:text-white">{site.phone}</a></li>}
              {site.email && <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>}
              {site.address && <li className="whitespace-pre-line">{site.address}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{site.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
          {site.social.length > 0 && (
            <ul className="flex gap-4">{site.social.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.label}</a></li>)}</ul>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => <li key={`${l.href}-${l.label}`}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
      </ul>
    </div>
  );
}
