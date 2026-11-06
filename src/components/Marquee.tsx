import { Phone } from "lucide-react";
import { telHref } from "@/config/site";

/**
 * Endless scrolling strip of offers with the phone number. Pure CSS (see .marquee in globals.css):
 * the list is rendered twice and slides by half its width, so the loop is seamless.
 * Keeps scrolling on hover; stops only for visitors who prefer reduced motion.
 */
export default function Marquee({ items, phone }: { items: string[]; phone?: string }) {
  if (!items.length && !phone) return null;
  const callLabel = phone ? `Call ${phone.replace(/^\+91\s*/, "")}` : "";

  const row = (copy: number) => (
    <ul aria-hidden={copy > 0} className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <li key={`${copy}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-[15px] font-semibold text-ink-900 md:text-base">{t}</span>
          <Star />
          {phone && i % 3 === 2 && (
            <>
              <a href={telHref(phone)} tabIndex={copy > 0 ? -1 : undefined} className="mx-3 inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-1.5 text-[15px] font-bold text-white transition-colors hover:bg-ink-700 md:text-base">
                <Phone className="h-4 w-4 text-taxi" />{callLabel}
              </a>
              <Star />
            </>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Offers" className="marquee relative overflow-hidden bg-taxi py-3.5">
      <div className="marquee-track flex w-max">
        {row(0)}
        {row(1)}
      </div>
    </section>
  );
}

const Star = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand-600" aria-hidden>
    <path fill="currentColor" d="M12 2l2.6 6.9L22 9.3l-5.8 4.6 2 7.1L12 17l-6.2 4 2-7.1L2 9.3l7.4-.4z" />
  </svg>
);
