"use client";
import { ArrowRight } from "lucide-react";
import WhatsAppIcon from "../WhatsAppIcon";
import { useSite } from "../SiteProvider";
import { buildDirectMessage, openWhatsApp, type Entry } from "@/lib/whatsapp";

/** Sends the trip details plus the chosen vehicle/driver to WhatsApp. */
export default function RequestButton({ title, entries, label, className = "" }: { title: string; entries: Entry[]; label: string; className?: string }) {
  const site = useSite();
  return (
    <button
      type="button"
      onClick={() => openWhatsApp(buildDirectMessage(title, entries), site.whatsappNumber)}
      className={`btn-primary group/r h-11 rounded-xl px-5 text-sm ${className}`}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover/r:translate-x-0.5" />
    </button>
  );
}
