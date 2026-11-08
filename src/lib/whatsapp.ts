import { site } from "@/config/site";

export type Entry = { label: string; value: string };

export function buildMessage(
  title: string,
  entries: Entry[],
  contact?: { name?: string; phone?: string }
) {
  const lines = [
    `Hello ${site.name}, I would like a quote.`,
    "",
    `*${title}*`,
    ...entries.filter((e) => e.value).map((e) => `• ${e.label}: ${e.value}`),
  ];
  if (contact?.name) lines.push("", `Name: ${contact.name}`);
  if (contact?.phone) lines.push(`Phone: ${contact.phone}`);
  return lines.join("\n");
}

export function buildDirectMessage(title: string, entries: Entry[]) {
  return buildMessage(title, entries);
}

/** `number` comes from site settings (useSite() on the client, getSettings() on the server). */
/** A vehicle's key facts for a WhatsApp message: type, specs, price and a link to its page. */
export function vehicleEntries(v: { typeName?: string; specs: { label: string; value: string }[]; pricePerDay?: number; slug: string }, showPrice = false): Entry[] {
  const link = typeof window !== "undefined" ? `${window.location.origin}/vehicle/${v.slug}/` : `/vehicle/${v.slug}/`;
  return [
    ...(v.typeName ? [{ label: "Type", value: v.typeName }] : []),
    ...v.specs.slice(0, 4).map((s) => ({ label: s.label, value: s.value })),
    ...(showPrice && v.pricePerDay ? [{ label: "Price", value: `₹${v.pricePerDay.toLocaleString("en-IN")} / day` }] : []),
    { label: "Link", value: link },
  ];
}

export function whatsappHref(message: string, number = "") {
  const text = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function whatsappChatHref(number = "") {
  return whatsappHref(`Hello ${site.name}, I have a question.`, number);
}

export function openWhatsApp(message: string, number = "") {
  const href = whatsappHref(message, number);
  if (typeof window !== "undefined") {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = href;
    } else {
      const win = window.open(href, "_blank", "noopener,noreferrer");
      if (!win) {
        window.location.href = href;
      }
    }
  }
}
