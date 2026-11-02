"use client";
import { Phone } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { whatsappChatHref } from "@/lib/whatsapp";
import { site } from "@/config/site";

export default function WhatsAppFab() {
  const phoneHref = site.phone ? `tel:${site.phone.replace(/\s/g, "")}` : "tel:+919876543210";

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex flex-col items-end gap-2.5">
      {/* Floating Call button positioned directly above the WhatsApp button */}
      <a
        href={phoneHref}
        aria-label="Call Gadiride"
        className="group flex h-12 items-center gap-2 rounded-full bg-ink-900 px-3.5 text-white shadow-float transition-all hover:bg-brand-500 hover:scale-105 active:scale-95"
      >
        <Phone className="h-5 w-5" />
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[90px] md:inline">
          Call us
        </span>
      </a>

      {/* WhatsApp button */}
      <a
        href={whatsappChatHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Gadiride on WhatsApp"
        className="group flex h-14 items-center gap-2 rounded-full bg-whatsapp px-4 text-white shadow-float transition-all hover:bg-whatsapp-dark hover:scale-105 active:scale-95"
      >
        <WhatsAppIcon className="h-6 w-6" />
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[120px] md:inline">
          Chat with us
        </span>
      </a>
    </div>
  );
}
