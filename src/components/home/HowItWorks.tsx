import SectionTitle from "../SectionTitle";

const STEPS = [
  { t: "Choose a vehicle or service", d: "Pick a group in the booking card or browse the fleet." },
  { t: "Share your details", d: "Dates, places, passengers, load or site. Only what we need to quote." },
  { t: "Send it on WhatsApp", d: "Your request opens in WhatsApp, already written. Press send." },
  { t: "Our team confirms", d: "We reply with availability and price. Your booking is confirmed only after that." },
];

export default function HowItWorks() {
  return (
    <section className="section-y bg-surface-50" aria-labelledby="how-title">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionTitle id="how-title">How booking works<span className="text-brand-500">.</span></SectionTitle>
          <p className="lead mt-4">A request, not an instant booking. A person from our team checks every one.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.t} className="rounded-card bg-white p-6 shadow-card">
              <span className="font-display text-5xl font-extrabold text-brand-500">{i + 1}</span>
              <h3 className="mt-4 font-head text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
