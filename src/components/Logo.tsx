/**
 * Gadiride wordmark, drawn from the brand logo: rounded Fredoka lettering in the
 * amber-to-orange gradient, a location pin and the swoosh above. Built as live
 * text + SVG so it stays crisp and works on both light and dark headers.
 * The full illustrated logo lives at /brand/gadiride-logo.webp.
 */
export default function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const swooshTail = tone === "light" ? "#BABAC2" : "#4D4D55";
  return (
    <span className={`relative inline-flex items-end font-brand text-[1.75rem] font-semibold leading-none tracking-[-0.01em] ${className}`}>
      <svg viewBox="0 0 120 14" className="pointer-events-none absolute -top-[0.42em] left-[0.4em] h-[0.42em] w-[3.6em]" aria-hidden="true">
        <defs>
          <linearGradient id="logo-swoosh" x1="0" x2="1">
            <stop offset="0" stopColor="#FDB022" />
            <stop offset="0.65" stopColor="#F47A16" />
            <stop offset="1" stopColor={swooshTail} />
          </linearGradient>
        </defs>
        <path d="M2 13 Q60 -6 118 11" fill="none" stroke="url(#logo-swoosh)" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
      <span className="text-gradient pb-[0.06em]">Gadiride</span>
      <svg viewBox="0 0 24 34" className="mb-[0.08em] ml-[0.04em] h-[0.95em] w-[0.67em] self-start" aria-hidden="true">
        <defs>
          <linearGradient id="logo-pin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FA9A2A" />
            <stop offset="1" stopColor="#E8540C" />
          </linearGradient>
        </defs>
        <path d="M12 1C6 1 1.5 5.4 1.5 11.2 1.5 18.6 12 27 12 27s10.5-8.4 10.5-15.8C22.5 5.4 18 1 12 1Z" fill="url(#logo-pin)" />
        <circle cx="12" cy="11" r="4.2" fill="#fff" />
        <circle cx="12" cy="31" r="2.6" fill={tone === "light" ? "#ffffff" : "#3A1F14"} />
      </svg>
    </span>
  );
}
