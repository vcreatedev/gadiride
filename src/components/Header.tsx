"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ChevronDown, Phone, Building2 } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import Logo from "./Logo";
import CategoryIcon from "./CategoryIcon";
import { GROUPS } from "@/data/vehicles";
import { site } from "@/config/site";
import { whatsappChatHref } from "@/lib/whatsapp";
import { selectTab } from "@/lib/events";
import { scrollToTarget } from "@/lib/lenis";
import { gsap } from "@/lib/motion";

const MORE = [
  { href: "/services/", label: "All services" },
  { href: "/services/#driver-services", label: "Driver services" },
  { href: "/careers/", label: "Careers" },
  { href: "/about/", label: "About us" },
  { href: "/faq/", label: "FAQ" },
  { href: "/contact/", label: "Contact" },
];

export default function Header() {
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  const [compact, setCompact] = useState(false);
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const home = path === "/";

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24);
      setCompact(home && window.scrollY > window.innerHeight * 1.05);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  useEffect(() => {
    if (!bar.current) return;
    gsap.to(bar.current, { height: compact ? "auto" : 0, opacity: compact ? 1 : 0, duration: 0.3, ease: "power2.out" });
  }, [compact]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!moreRef.current?.contains(e.target as Node)) setMore(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  useEffect(() => { setMenu(false); setMore(false); }, [path]);

  const dark = !solid;
  const navCls = (active: boolean) =>
    `flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
      active ? "border-brand-500" : "border-transparent"
    } ${dark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-surface-50"}`;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-line bg-white/95 backdrop-blur" : "bg-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900">Skip to content</a>
      <div className="container-x flex h-[60px] items-center justify-between gap-4 md:h-[72px]">
        <Link href="/" aria-label="Gadiride home"><Logo tone={dark ? "light" : "dark"} /></Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {GROUPS.map((g) => (
            <Link key={g.id} href={`/vehicles/${g.id}/`} className={navCls(path.startsWith(`/vehicles/${g.id}`))}>
              <CategoryIcon id={g.id} className="h-5 w-6" />
              {g.short}
            </Link>
          ))}
          <Link href="/corporate/" className={navCls(path.startsWith("/corporate"))}>
            <Building2 className="h-4 w-4" />Corporate
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
          {site.phone && (
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className={`hidden items-center gap-2 px-3 text-sm font-semibold md:flex ${dark ? "text-white" : "text-ink-900"}`}>
              <Phone className="h-4 w-4" />Call
            </a>
          )}
          <a href={whatsappChatHref()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp hidden min-h-10 px-4 text-sm sm:inline-flex">
            <WhatsAppIcon className="h-4 w-4" />WhatsApp
          </a>
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${dark ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-surface-50"}`} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink-900/50" />
              <Dialog.Content data-lenis-prevent className="fixed inset-y-0 right-0 z-[70] flex w-[min(380px,100vw)] flex-col overflow-y-auto bg-white p-6 pt-[max(1.5rem,env(safe-area-inset-top))] shadow-float">
                <div className="mb-8 flex items-center justify-between">
                  <Dialog.Title asChild><span><Logo /></span></Dialog.Title>
                  <Dialog.Close className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-50" aria-label="Close menu"><X className="h-6 w-6" /></Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
                <nav aria-label="Mobile" className="flex flex-col gap-1">
                  {GROUPS.map((g) => (
                    <Link key={g.id} href={`/vehicles/${g.id}/`} className="flex items-center gap-3 rounded-field px-3 py-3.5 font-head text-lg font-bold text-ink-900 hover:bg-surface-50">
                      <CategoryIcon id={g.id} className="h-6 w-8 text-brand-500" />{g.name}
                    </Link>
                  ))}
                  <Link href="/corporate/" className="flex items-center gap-3 rounded-field px-3 py-3.5 font-head text-lg font-bold text-ink-900 hover:bg-surface-50"><Building2 className="h-6 w-8 text-brand-500" />Corporate</Link>
                  <hr className="my-3 border-line" />
                  {MORE.map((m) => (
                    <Link key={m.href} href={m.href} className="rounded-field px-3 py-3 text-base font-medium text-ink-900 hover:bg-surface-50">{m.label}</Link>
                  ))}
                </nav>
                <a href={whatsappChatHref()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-auto w-full"><WhatsAppIcon className="h-5 w-5" />Chat on WhatsApp</a>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {home && (
        <div ref={bar} className="hidden h-0 overflow-hidden opacity-0 lg:block" aria-hidden={!compact}>
          <div className="container-x flex items-center gap-3 pb-3">
            <span className="text-sm font-semibold text-ink-900">Quick quote</span>
            {GROUPS.map((g) => (
              <button key={g.id} type="button" tabIndex={compact ? 0 : -1} className="chip" onClick={() => { selectTab(g.id); scrollToTarget("#book", -120); }}>
                <CategoryIcon id={g.id} className="h-4 w-5" />{g.short}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
