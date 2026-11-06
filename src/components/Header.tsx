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
    `flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
      active ? "border-brand-500" : "border-transparent"
    } ${dark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-surface-50"}`;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-line bg-white/95 backdrop-blur" : "bg-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900">Skip to content</a>
      <div className="container-x flex h-[60px] items-center justify-between gap-4 md:h-[72px]">
        <Link href="/" aria-label="Gadiride home">{brand(dark)}</Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {groups.map((g) => (
            <Link key={g.id} href={`/vehicles/${g.id}/`} className={navCls(path.startsWith(`/vehicles/${g.id}`))}>
              <CategoryIcon id={g.id} className="h-5 w-6" />
              {g.short}
            </Link>
          ))}
          <Link href="/drivers/" className={navCls(path.startsWith("/drivers"))}>
            <CategoryIcon id="driver" className="h-5 w-6" />{site.driversLabel}
          </Link>
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

        <div className="flex items-center gap-2">
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
          <a href={whatsappChatHref(site.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp hidden min-h-10 px-4 text-sm sm:inline-flex">
            <WhatsAppIcon className="h-4 w-4" />WhatsApp
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
                  {groups.map((g) => (
                    <Link key={g.id} href={`/vehicles/${g.id}/`} className="flex items-center gap-3 rounded-field px-3 py-3.5 font-head text-lg font-semibold text-ink-900 hover:bg-surface-50">
                      <CategoryIcon id={g.id} className="h-6 w-8 text-brand-500" />{g.name}
                    </Link>
                  ))}
                  <Link href="/drivers/" className="flex items-center gap-3 rounded-field px-3 py-3.5 font-head text-lg font-semibold text-ink-900 hover:bg-surface-50"><CategoryIcon id="driver" className="h-6 w-8 text-brand-500" />{site.driversLabel}</Link>
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
