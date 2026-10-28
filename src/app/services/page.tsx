import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import VehicleSvg from "@/components/VehicleSvg";
import ExpandForm from "@/components/ExpandForm";
import { SERVICES } from "@/data/services";

export const metadata: Metadata = { title: "Services", description: "Car rental, passenger transport, goods transport, heavy equipment hire, corporate fleet and driver services." };

export default function ServicesPage() {
  return (
    <>
      <PageHero title={<>Our services<span className="text-brand-500">.</span></>} intro="Who each service is for, what it includes and how to ask for a quote." art="bus" color="#F4F5F7" />
      {SERVICES.map((s, i) => {
        const dark = i % 2 === 1;
        return (
          <section key={s.id} id={s.id} className={`scroll-mt-20 py-16 md:py-24 ${dark ? "bg-ink-900 text-ink-300" : i % 4 === 0 ? "bg-white" : "bg-surface-50"}`} aria-labelledby={`${s.id}-h`}>
            <div className="container-x grid items-center gap-10 lg:grid-cols-2">
              <div className={i % 2 ? "lg:order-2" : ""}>
                <p className={`text-sm font-medium ${dark ? "text-brand-500" : "text-brand-600"}`}>For {s.forWho.toLowerCase()}</p>
                <h2 id={`${s.id}-h`} className={`display mt-2 text-5xl md:text-6xl ${dark ? "text-white" : ""}`}>{s.name}</h2>
                <p className="lead mt-4">{s.offer}</p>
                <ul className="mt-6 space-y-2">
                  {s.points.map((p) => <li key={p} className={`flex items-center gap-3 font-medium ${dark ? "text-white" : "text-ink-900"}`}><span className="h-2 w-2 rounded-full bg-brand-500" />{p}</li>)}
                </ul>
                {s.toConfirm && <p className="mt-4 text-sm text-ink-400">Details of this service are confirmed on WhatsApp.</p>}
                <ExpandForm formKey={s.form} label={s.cta} dark={dark} />
              </div>
              <div className={`grid aspect-[4/3] place-items-center rounded-card ${dark ? "bg-ink-800" : "bg-[linear-gradient(160deg,#F4F5F7,#D6D9DE)]"} px-[8%] ${i % 2 ? "lg:order-1" : ""}`}>
                <VehicleSvg art={s.art} color={s.color} className="w-full" />
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
