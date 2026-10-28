import type { GroupId } from "@/data/vehicles";

/** Simple stroke icons for the four vehicle groups. */
export default function CategoryIcon({ id, className = "h-6 w-6" }: { id: GroupId; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden="true">
      {id === "cars" && (<><path {...p} d="M3 16v-3.5l3-1 3.5-4.5h10l5 4.5 4 .8V16" /><path {...p} d="M3 16h26" /><circle {...p} cx="9" cy="17" r="2.6" /><circle {...p} cx="23" cy="17" r="2.6" /></>)}
      {id === "passenger" && (<><path {...p} d="M3 17V5.5A1.5 1.5 0 0 1 4.5 4H24l5 7v6" /><path {...p} d="M3 17h26M7 8h4M14 8h4M21 8h3" /><circle {...p} cx="9" cy="18" r="2.4" /><circle {...p} cx="23" cy="18" r="2.4" /></>)}
      {id === "logistics" && (<><path {...p} d="M2 16V4h17v12" /><path {...p} d="M19 8h5l5 5v3H2" /><circle {...p} cx="8" cy="18" r="2.4" /><circle {...p} cx="24" cy="18" r="2.4" /></>)}
      {id === "equipment" && (<><path {...p} d="M8 15V9h6l1-4h5v10" /><path {...p} d="M20 11l7 3 1 4h-5" /><path {...p} d="M8 11L3 4 1 9" /><circle {...p} cx="10" cy="18" r="3" /><circle {...p} cx="20" cy="19" r="2" /></>)}
    </svg>
  );
}
