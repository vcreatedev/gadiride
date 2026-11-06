import type { HeroTheme } from "./HeroScene";

/** Indian-style black-and-white painted kerb. */
const KERB = "bg-[repeating-linear-gradient(90deg,#17181c_0px,#17181c_26px,#F4F5F7_26px,#F4F5F7_52px)]";

/**
 * A still road along the bottom of the hero: striped kerb, black asphalt with white edge
 * lines and dashed lane marks, a second kerb, then the pavement. It never animates.
 */
export default function Road({ theme, compact = false }: { theme: HeroTheme; compact?: boolean }) {
  return (
  <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 ${compact ? "h-16" : "top-0"}`}>
    <div className={`absolute inset-0 ${theme === "dark" ? "bg-[#0e0f11]" : "bg-[#EEF0F3]"}`} />
    {/* asphalt */}
    <div className={`absolute inset-x-0 top-0 ${compact ? "bottom-0" : "h-[calc(var(--horizon)+2.75rem)]"} bg-[linear-gradient(180deg,#34363d_0%,#2a2c32_55%,#232429_100%)]`}>
      <div className="absolute inset-x-0 top-[14px] h-[3px] bg-white/85" />
      {!compact && <div className="absolute inset-x-0 bottom-[10px] h-[3px] bg-white/85" />}
      <svg viewBox="0 0 1440 10" preserveAspectRatio="none" className={`absolute inset-x-0 ${compact ? "top-[60%]" : "top-[46%]"} h-[6px] w-full`}>
        <path d="M0 5 H1440" stroke="#FFFFFF" strokeWidth="10" strokeDasharray="60 40" />
      </svg>
    </div>
    {/* kerbs */}
    <div className={`absolute inset-x-0 top-0 h-[10px] ${KERB} shadow-[0_2px_0_rgba(0,0,0,0.25)]`} />
    {!compact && <div className={`absolute inset-x-0 top-[calc(var(--horizon)+2.75rem)] h-[10px] ${KERB} shadow-[0_2px_0_rgba(0,0,0,0.2)]`} />}
  </div>
);
}
