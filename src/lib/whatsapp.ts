import { site } from "@/config/site";

export type Entry = { label: string; value: string };

export function buildMessage(title: string, entries: Entry[], contact: { name: string; phone: string }) {
  const lines = [
    `Hello ${site.name}, I would like a quote.`,
    "",
    `*${title}*`,
    ...entries.filter((e) => e.value).map((e) => `${e.label}: ${e.value}`),
    "",
    `Name: ${contact.name}`,
    `Phone: ${contact.phone}`,
  ];
  return lines.join("\n");
}

export function whatsappHref(message: string) {
  const text = encodeURIComponent(message);
  return site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function whatsappChatHref() {
  return whatsappHref(`Hello ${site.name}, I have a question.`);
}
