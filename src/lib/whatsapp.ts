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

export function whatsappHref(message: string) {
  const text = encodeURIComponent(message);
  return site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function whatsappChatHref() {
  return whatsappHref(`Hello ${site.name}, I have a question.`);
}

export function openWhatsApp(message: string) {
  const href = whatsappHref(message);
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
