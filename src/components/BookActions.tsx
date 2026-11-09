"use client";
import { PhoneCall } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { useSite } from "./SiteProvider";
import { telHref } from "@/config/site";
import { buildDirectMessage, openWhatsApp, vehicleEntries, type Entry } from "@/lib/whatsapp";
import type { Vehicle } from "@/data/vehicles";

/**
 * Booking buttons used on every vehicle card: WhatsApp (message pre-filled with the
 * vehicle and any trip details) and Call Us. Equal widths so cards line up.
 */
export default function BookActions({
  title,
  vehicle,
  entries = [],
  details,
  showPrice = false,
  size = "md",
  className = "",
}: {
  title: string;
  vehicle: string;
  entries?: Entry[];
  /** The vehicle itself: its type, specs, price and page link go into the message. */
  details?: Pick<Vehicle, "typeName" | "specs" | "pricePerDay" | "slug" | "location" | "area">;
  showPrice?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const site = useSite();
  const h = size === "lg" ? "h-12 text-base" : "h-11 text-[15px]";
  const btn = `inline-flex ${h} min-w-0 items-center justify-center gap-2 rounded-lg px-3 font-medium text-white transition-all active:scale-[0.98]`;
  return (
    <div className={`grid gap-2.5 ${site.phone ? "grid-cols-2" : "grid-cols-1"} ${className}`}>
      <button
        type="button"
        onClick={() => openWhatsApp(buildDirectMessage(title, [{ label: "Vehicle", value: vehicle }, ...(details ? vehicleEntries(details, showPrice) : []), ...entries]), site.whatsappNumber)}
        className={`${btn} bg-whatsapp hover:bg-whatsapp-dark`}
        aria-label={`Book ${vehicle} on WhatsApp`}
      >
        <WhatsAppIcon className="h-5 w-5 shrink-0" />
        <span className="truncate">WhatsApp</span>
      </button>
      {site.phone && (
        <a href={telHref(site.phone)} className={`${btn} bg-brand-gradient shadow-[0_6px_16px_-8px_rgba(232,84,12,0.7)] hover:brightness-110`} aria-label={`Call ${site.phone} to book ${vehicle}`}>
          <PhoneCall className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Call Us</span>
        </a>
      )}
    </div>
  );
}
