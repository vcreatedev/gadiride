import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import PageHero from "@/components/PageHero";
import { site } from "@/config/site";
import { whatsappChatHref } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact", description: "Contact Gadiride on WhatsApp for vehicle quotes and enquiries." };

export default function ContactPage() {
  const rows = [
    site.phone && { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.address && { icon: MapPin, label: "Address", value: site.address },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];
  return (
    <>
      <PageHero title={<>Talk to us<span className="text-brand-500">.</span></>} intro="WhatsApp is the fastest way to reach our team." />
      <section className="section-y bg-white">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          <div className="rounded-card bg-ink-900 p-8 text-white md:p-10">
            <WhatsAppIcon className="h-10 w-10 text-whatsapp" />
            <h2 className="mt-6 font-head text-3xl font-bold text-white">Chat on WhatsApp</h2>
            <p className="mt-3 text-ink-300">Ask about any vehicle, service or job. Our team replies on WhatsApp.</p>
            <a href={whatsappChatHref()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8"><WhatsAppIcon className="h-5 w-5" />Open WhatsApp</a>
          </div>
          <div className="rounded-card bg-surface-50 p-8 md:p-10">
            <h2 className="font-head text-2xl font-bold">Other ways to reach us</h2>
            {rows.length ? (
              <ul className="mt-6 space-y-5">
                {rows.map((r) => (
                  <li key={r.label} className="flex gap-4">
                    <r.icon className="mt-0.5 h-5 w-5 text-brand-500" />
                    <div><p className="text-sm text-ink-400">{r.label}</p>{r.href ? <a href={r.href} className="font-semibold text-ink-900 hover:text-brand-600">{r.value}</a> : <p className="font-semibold text-ink-900">{r.value}</p>}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4">Phone, email and address will appear here once confirmed. Until then, please use WhatsApp.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
