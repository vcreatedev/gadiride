import Link from "next/link";
import Logo from "./Logo";
import { GROUPS } from "@/data/vehicles";
import { SERVICES } from "@/data/services";
import { site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-ink-900 pb-24 pt-16 text-ink-300 md:pb-12">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed">Cars, passenger vehicles, logistics vehicles and heavy equipment. One place, one message away.</p>
          </div>
          <FooterCol title="Vehicles" links={GROUPS.map((g) => ({ href: `/vehicles/${g.id}/`, label: g.name }))} />
          <FooterCol title="Services" links={SERVICES.map((s) => ({ href: `/services/#${s.id}`, label: s.name }))} />
          <FooterCol title="Company" links={[{ href: "/about/", label: "About us" }, { href: "/careers/", label: "Careers" }, { href: "/corporate/", label: "Corporate" }, { href: "/faq/", label: "FAQ" }]} />
          <div>
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/contact/" className="hover:text-white">Contact page</Link></li>
              {site.phone && <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">{site.phone}</a></li>}
              {site.email && <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>}
              {site.address && <li>{site.address}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Gadiride</p>
          {site.social.length > 0 && (
            <ul className="flex gap-4">{site.social.map((s) => <li key={s.href}><a href={s.href} className="hover:text-white">{s.label}</a></li>)}</ul>
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
        {links.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
      </ul>
    </div>
  );
}
