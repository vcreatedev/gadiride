/** Provisional wordmark until the client logo is supplied. */
export default function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-[1.6rem] font-extrabold uppercase leading-none tracking-tight ${tone === "light" ? "text-white" : "text-ink-900"} ${className}`}>
      <svg viewBox="0 0 40 28" className="h-6 w-8" aria-hidden="true">
        <path d="M4 22 A16 16 0 0 1 36 22" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M20 22 L31 10" stroke="#F2611D" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="20" cy="22" r="3" fill="#F2611D" />
      </svg>
      Gadiride
    </span>
  );
}
