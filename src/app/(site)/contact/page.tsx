import { Phone, Mail, MapPin } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import PageHero from "@/components/PageHero";
import { accent } from "@/components/Accent";
import { telHref } from "@/config/site";
import { getPage, getSettings, pageMetadata } from "@/lib/content";
import { whatsappChatHref } from "@/lib/whatsapp";

export const generateMetadata = () => pageMetadata("contact");

export default async function ContactPage() {
  const [p, site] = await Promise.all([getPage("contact"), getSettings()]);
  const rows = [
    site.phone && { icon: Phone, label: "Phone", value: site.phone, href: telHref(site.phone) },
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.address && { icon: MapPin, label: "Address", value: site.address },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} />
      <section className="section-y bg-white">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          <div className="rounded-card bg-ink-900 p-8 text-white md:p-10">
            <WhatsAppIcon className="h-10 w-10 text-whatsapp" />
            <h2 className="mt-6 font-head text-3xl font-semibold text-white">{p.whatsappTitle}</h2>
            <p className="mt-3 text-ink-300">{p.whatsappText}</p>
            <a href={whatsappChatHref(site.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8"><WhatsAppIcon className="h-5 w-5" />{p.whatsappCta}</a>
          </div>
          <div className="rounded-card bg-surface-50 p-8 md:p-10">
            <h2 className="font-head text-2xl font-semibold">{p.otherTitle}</h2>
            {rows.length ? (
              <ul className="mt-6 space-y-5">
                {rows.map((r) => (
                  <li key={r.label} className="flex gap-4">
                    <r.icon className="mt-0.5 h-5 w-5 text-brand-500" />
                    <div><p className="text-sm text-ink-400">{r.label}</p>{r.href ? <a href={r.href} className="font-semibold text-ink-900 hover:text-brand-600">{r.value}</a> : <p className="whitespace-pre-line font-semibold text-ink-900">{r.value}</p>}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4">{p.emptyText}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
