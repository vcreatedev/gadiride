import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import RequestForm from "@/components/RequestForm";
import { CAREER_ROLES } from "@/data/services";

export const metadata: Metadata = { title: "Careers", description: "Work with Gadiride as a driver, heavy vehicle driver, equipment operator or in operations." };

export default function CareersPage() {
  return (
    <>
      <PageHero title={<>Drive with us<span className="text-brand-500">.</span></>} intro="We work with drivers, operators and office staff. Send your details and we will contact you when there is a matching opening." art="truck" color="#F2611D" />
      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="h2">Roles we hire for<span className="text-brand-500">.</span></h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {CAREER_ROLES.map((r) => (
                <li key={r.role} className="py-5"><h3 className="font-head text-lg font-bold">{r.role}</h3><p className="mt-1">{r.detail}</p></li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-400">Current openings are shared on WhatsApp. No listings are shown here until confirmed.</p>
          </div>
          <div className="rounded-card bg-surface-50 p-6 sm:p-8">
            <h2 className="font-head text-2xl font-bold">Send your details</h2>
            <p className="mb-6 mt-2 text-sm">Your details open in WhatsApp. Send the message to apply.</p>
            <RequestForm formKey="careers" compact />
          </div>
        </div>
      </section>
    </>
  );
}
