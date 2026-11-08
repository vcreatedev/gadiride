"use client";
import { ArrowRight } from "lucide-react";
import WhatsAppIcon from "../WhatsAppIcon";
import { useSite } from "../SiteProvider";
import { buildDirectMessage, openWhatsApp, type Entry } from "@/lib/whatsapp";

/** Sends the trip details plus the chosen vehicle/driver to WhatsApp. */
/** `href`: a page on this site (e.g. the trip); its full link is added to the message. */
export default function RequestButton({ title, entries, label, className = "", href }: { title: string; entries: Entry[]; label: string; className?: string; href?: string }) {
  const site = useSite();
  return (
    <button
      type="button"
      onClick={() => openWhatsApp(buildDirectMessage(title, href ? [...entries, { label: "Link", value: `${window.location.origin}${href}` }] : entries), site.whatsappNumber)}
      className={`btn-primary group/r h-11 rounded-xl px-5 text-sm ${className}`}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover/r:translate-x-0.5" />
    </button>
  );
}
