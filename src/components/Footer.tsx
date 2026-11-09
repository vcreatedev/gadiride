import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, type LucideIcon } from "lucide-react";
import { telHref } from "@/config/site";
import type { Group } from "@/data/vehicles";
import type { ServiceItem, Settings } from "@/lib/content";
import Photo from "./Photo";

/** The icon for a social link, from its address. */
function socialIcon(href: string): LucideIcon | null {
  if (/instagram\.com/i.test(href)) return Instagram;
  if (/facebook\.com|fb\.com/i.test(href)) return Facebook;
  if (/youtube\.com|youtu\.be/i.test(href)) return Youtube;
  if (/linkedin\.com/i.test(href)) return Linkedin;
  if (/twitter\.com|x\.com/i.test(href)) return Twitter;
  return null;
}

export default function Footer({ settings: site, groups, services }: { settings: Settings; groups: Group[]; services: ServiceItem[] }) {
  // Columns from Site settings; with none set, list the vehicle groups and services from the catalogue.
  const columns = site.footerColumns.length
    ? site.footerColumns
    : [
        { title: "Vehicles", links: groups.map((g) => ({ href: `/vehicles/${g.id}/`, label: g.name })) },
        { title: "Services", links: services.map((s) => ({ href: `/services/#${s.id}`, label: s.name })) },
      ];
  const logo = site.logo ?? { src: "/brand/gadiride-logo.webp", alt: "Gadiride", width: 1248, height: 518 };
  // Bottom line: the same gap above and below its text (pt-5 on the line, pb-5 here), plus the phone's
  // safe area. The text is centred; the floating Call / WhatsApp buttons sit at the right edge beside it.
  return (
    <footer className="bg-ink-900 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-16 text-ink-300">
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
        {/* Follow us: its own row on the left, above the bottom line. */}
        {site.showSocial && site.social.length > 0 && (
          <div className="mt-12 flex flex-col items-start gap-3">
            {site.socialTitle && <p className="text-sm font-semibold text-white">{site.socialTitle}</p>}
            <ul className="flex flex-wrap gap-3">
              {site.social.map((s) => {
                const Icon = socialIcon(s.href);
                return (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${s.label}`} title={s.label}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/10 transition-colors hover:bg-brand-gradient hover:ring-transparent">
                      {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-semibold">{s.label.charAt(0)}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {/* Bottom line: copyright, then the website credit, centred one under the other. */}
        <div className="mt-8 flex flex-col items-center gap-1.5 border-t border-white/10 pt-5 text-center text-xs leading-relaxed">
          <p>{site.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
          {site.showCredit && site.creditName && (
            <p>
              {site.creditLabel}{" "}
              {site.creditUrl ? (
                <a href={site.creditUrl} target="_blank" rel="noopener" className="font-semibold text-white underline-offset-4 hover:text-brand-300 hover:underline">{site.creditName}</a>
              ) : <span className="font-semibold text-white">{site.creditName}</span>}
            </p>
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
