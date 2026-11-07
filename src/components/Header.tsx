"use client";
import { useCatalog } from "./SiteProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import Logo from "./Logo";
import Photo from "./Photo";
import CategoryIcon from "./CategoryIcon";
import { telHref } from "@/config/site";
import { useSite } from "./SiteProvider";
import { whatsappChatHref } from "@/lib/whatsapp";
import { NAV_ITEMS, orderSections } from "@/data/sections";
import type { GroupId } from "@/data/vehicles";

type NavItem = { id: GroupId | "driver"; href: string; short: string; name: string };

export default function Header() {
  const { groups } = useCatalog();
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const home = path === "/";
  const site = useSite();
  const MORE = site.navMore;
  // Menu links in the editor's order (Site settings → Header: menu order); hidden ones are left out.
  const nav = orderSections(site.navOrder, NAV_ITEMS).flatMap((key): NavItem[] => {
    if (key === "drivers") return [{ id: "driver", href: "/drivers/", short: site.driversLabel, name: site.driversLabel }];
    const g = groups.find((x) => x.id === key);
    return g ? [{ id: g.id, href: `/vehicles/${g.id}/`, short: g.short, name: g.name }] : [];
  });
  const brand = (light: boolean) =>
    site.headerLogo ? <Photo photo={site.headerLogo} alt={site.headerLogo.alt ?? site.name} sizes="180px" priority className="h-9 w-auto md:h-10" /> : <Logo tone={light ? "light" : "dark"} />;

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);


  useEffect(() => {
    const close = (e: MouseEvent) => { if (!moreRef.current?.contains(e.target as Node)) setMore(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  useEffect(() => { setMenu(false); setMore(false); }, [path]);

  // White text over a dark hero; dark text over a light one. Solid white once scrolled.
  const dark = site.heroTheme === "dark" && !solid;
  const navCls = (active: boolean) =>
    `flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-colors xl:px-3.5 ${
      active ? "border-brand-500" : "border-transparent"
    } ${dark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-surface-50"}`;

  return (
    <header className={`fixed left-1/2 top-0 z-50 w-full max-w-container -translate-x-1/2 transition-colors duration-300 ${solid ? "border-b border-line bg-white/95 backdrop-blur" : "bg-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900">Skip to content</a>
      <div className="container-x flex h-[60px] items-center justify-between gap-4 md:h-[72px]">
        <Link href="/" aria-label="Gadiride home" className="shrink-0">{brand(dark)}</Link>

        {/* Laptop widths (lg to xl): no menu icons and a round WhatsApp button, so the row never overflows. */}
        <nav aria-label="Main" className="hidden min-w-0 items-center gap-0.5 lg:flex xl:gap-1">
          {nav.map((n) => (
            <Link key={n.id} href={n.href} className={navCls(path.startsWith(n.href))}>
              <CategoryIcon id={n.id} className="hidden h-5 w-6 xl:block" />
              {n.short}
            </Link>
          ))}
          <div ref={moreRef} className="relative">
            <button type="button" aria-expanded={more} aria-controls="more-menu" onClick={() => setMore((m) => !m)} className={navCls(MORE.some((m) => path.startsWith(m.href.split("#")[0]) && m.href !== "/"))}>
              More <ChevronDown className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} />
            </button>
            {more && (
              <ul id="more-menu" className="absolute right-0 mt-2 w-56 rounded-field border border-line bg-white p-2 shadow-lift">
                {MORE.map((m) => (
                  <li key={m.href}><Link href={m.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-surface-50">{m.label}</Link></li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {site.phone && <a
            href={telHref(site.phone)}
            className={`hidden min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors sm:inline-flex ${
              dark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-line bg-white text-ink-900 hover:border-brand-500 hover:text-brand-600 shadow-sm"
            }`}
          >
            <Phone className="h-4 w-4 text-brand-500" />
            <span className="hidden tabular-nums xl:inline">{site.phone.replace(/^\+91\s*/, "")}</span>
            <span className="xl:hidden">Call</span>
          </a>}
          <a href={whatsappChatHref(site.whatsappNumber)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="btn-whatsapp hidden min-h-10 whitespace-nowrap px-4 text-sm sm:inline-flex lg:w-10 lg:px-0 xl:w-auto xl:px-4">
            <WhatsAppIcon className="h-4 w-4" /><span className="lg:hidden xl:inline">WhatsApp</span>
          </a>
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${dark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-surface-50"}`} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink-900/50" />
              <Dialog.Content data-lenis-prevent className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col overflow-y-auto bg-white px-4 pb-6 pt-[env(safe-area-inset-top)] shadow-float sm:px-6 lg:px-8">
                {/* same height and side padding as the header bar, so the logo and button don't move when the menu opens */}
                <div className="mb-6 flex h-[60px] shrink-0 items-center justify-between md:h-[72px]">
                  <Dialog.Title asChild><span>{brand(false)}</span></Dialog.Title>
                  <Dialog.Close className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-50" aria-label="Close menu"><X className="h-6 w-6" /></Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
                {/* -mx-3 cancels the links' own padding so icons and text line up with the logo */}
                <nav aria-label="Mobile" className="-mx-3 flex flex-col gap-1">
                  {nav.map((n) => (
                    <Link key={n.id} href={n.href} className="flex items-center gap-3 rounded-field px-3 py-3.5 font-head text-lg font-semibold text-ink-900 hover:bg-surface-50">
                      <CategoryIcon id={n.id} className="h-6 w-8 text-brand-500" />{n.name}
                    </Link>
                  ))}
                  <hr className="mx-3 my-3 border-line" />
                  {MORE.map((m) => (
                    <Link key={m.href} href={m.href} className="rounded-field px-3 py-3 text-base font-medium text-ink-900 hover:bg-surface-50">{m.label}</Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2.5 pt-6">
                  {site.phone && <a
                    href={telHref(site.phone)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-white font-semibold text-ink-900 transition-colors hover:bg-surface-50"
                  >
                    <Phone className="h-4 w-4 text-brand-500" />
                    <span>Call {site.phone}</span>
                  </a>}
                  <a
                    href={whatsappChatHref(site.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp flex h-12 w-full items-center justify-center gap-2 rounded-full"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

    </header>
  );
}
