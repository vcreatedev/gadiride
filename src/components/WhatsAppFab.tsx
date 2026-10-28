"use client";
import WhatsAppIcon from "./WhatsAppIcon";
import { whatsappChatHref } from "@/lib/whatsapp";

export default function WhatsAppFab() {
  return (
    <a
      href={whatsappChatHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Gadiride on WhatsApp"
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-whatsapp pl-4 pr-4 text-white shadow-float transition-all hover:bg-whatsapp-dark"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[120px] md:inline">Chat with us</span>
    </a>
  );
}
