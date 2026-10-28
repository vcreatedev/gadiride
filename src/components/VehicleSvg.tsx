import { useId } from "react";
import { ART, type ArtId, type Tone } from "@/data/vehicleArt";
import { mix } from "@/lib/color";

type Props = {
  art: ArtId;
  color?: string;
  mode?: "solid" | "line";
  className?: string;
  title?: string;
};

/**
 * Renders a vehicle from shared art data.
 * solid: painted rig with separate wheel groups (used by VehicleRig).
 * line:  stroke-only blueprint split into drawing tiers (used by LineStory).
 */
export default function VehicleSvg({ art: id, color = "#C9CDD3", mode = "solid", className, title }: Props) {
  const art = ART[id];
  const uid = useId().replace(/:/g, "");
  const [x, y, w, h] = art.viewBox;
  const tone = (t: Tone) => (t === "main" ? `url(#b-${uid})` : t === "alt" ? `url(#a-${uid})` : "#24262B");

  if (mode === "line") {
    return (
      <svg viewBox={`${x} ${y} ${w} ${h}`} className={className} fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <g data-tier="1" stroke="#d1d5db" strokeWidth={2.2} strokeLinejoin="round">
          {art.body.map((b, i) => <path key={i} d={b.d} />)}
        </g>
        <g data-tier="2" stroke="#9ca3af" strokeWidth={1.6} strokeLinejoin="round">
          {art.glass.map((d, i) => <path key={i} d={d} />)}
        </g>
        <g data-tier="3" stroke="#6b7280" strokeWidth={1.2}>
          {art.details.map((d, i) => <path key={i} d={d} />)}
          {art.arms?.flatMap((a) => a.paths.map((p, i) => <path key={a.id + i} d={p.d} stroke="#9ca3af" strokeWidth={1.6} />))}
        </g>
        <g data-tier="4" stroke="#d1d5db" strokeWidth={1.8}>
          {art.wheels.map((wh, i) => (
            <g key={i}>
              <circle cx={wh.cx} cy={wh.cy} r={wh.r} />
              <circle cx={wh.cx} cy={wh.cy} r={wh.r * 0.58} stroke="#9ca3af" strokeWidth={1.2} />
              <circle cx={wh.cx} cy={wh.cy} r={wh.r * 0.14} stroke="#ff5a1f" strokeWidth={1.2} />
            </g>
          ))}
        </g>
        <g data-tier="5" stroke="#ff5a1f" strokeWidth={2}>
          {art.lights.map((l, i) => <rect key={i} x={l.x} y={l.y} width={l.w} height={l.h} rx={2} />)}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} preserveAspectRatio="xMidYMax meet" overflow="visible">
      <defs>
        <linearGradient id={`b-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(color, "#ffffff", 0.32)} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="0.5" stopColor={mix(color, "#000000", 0.08)} />
          <stop offset="1" stopColor={mix(color, "#000000", 0.32)} />
        </linearGradient>
        <linearGradient id={`a-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D6D9DE" />
        </linearGradient>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a4452" />
          <stop offset="0.55" stopColor="#151a22" />
          <stop offset="1" stopColor="#0b0e13" />
        </linearGradient>
        <radialGradient id={`r-${uid}`}>
          <stop offset="0" stopColor="#f2f3f5" />
          <stop offset="0.7" stopColor="#a9aeb6" />
          <stop offset="1" stopColor="#6b7078" />
        </radialGradient>
        <radialGradient id={`m-${uid}`}>
          <stop offset="0" stopColor="#9aa0a8" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#7d838c" stopOpacity="0.75" />
          <stop offset="1" stopColor="#3a3d42" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <g data-rig="body">
        {art.arms?.filter((a) => a.id === "backhoe").map((a) => (
          <g key={a.id} data-arm={a.id} data-px={a.pivot[0]} data-py={a.pivot[1]}>
            {a.paths.map((p, i) => <path key={i} d={p.d} fill={tone(p.tone)} />)}
          </g>
        ))}
        {art.body.map((b, i) => <path key={i} d={b.d} fill={tone(b.tone)} />)}
        {art.glass.map((d, i) => <path key={i} d={d} fill={`url(#g-${uid})`} />)}
        {art.glass.map((d, i) => <path key={"h" + i} d={d} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={2} />)}
        {art.details.map((d, i) => <path key={i} d={d} fill="none" stroke="#000" strokeOpacity={0.16} strokeWidth={2} />)}
        {art.lights.map((l, i) => (
          <rect key={i} x={l.x} y={l.y} width={l.w} height={l.h} rx={3} fill={l.kind === "head" ? "#FFE9B8" : "#D8332C"} />
        ))}
        {art.wheels.map((wh, i) => <circle key={i} cx={wh.cx} cy={wh.cy} r={wh.r * 1.13} fill="#0d0e10" />)}
        {art.arms?.filter((a) => a.id !== "backhoe").map((a) => (
          <g key={a.id} data-arm={a.id} data-px={a.pivot[0]} data-py={a.pivot[1]}>
            {a.paths.map((p, i) => <path key={i} d={p.d} fill={tone(p.tone)} />)}
          </g>
        ))}
      </g>

      {art.wheels.map((wh, i) => (
        <g key={i} data-rig="wheel" data-cx={wh.cx} data-cy={wh.cy} data-r={wh.r}>
          <circle cx={wh.cx} cy={wh.cy} r={wh.r} fill="#141518" />
          <circle cx={wh.cx} cy={wh.cy} r={wh.r * 0.86} fill="#202328" />
          <g data-rig="spokes">
            <circle cx={wh.cx} cy={wh.cy} r={wh.r * 0.6} fill={`url(#r-${uid})`} />
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x={wh.cx - wh.r * 0.07} y={wh.cy - wh.r * 0.56} width={wh.r * 0.14} height={wh.r * 0.44} rx={wh.r * 0.05} fill="#3b3f46" transform={`rotate(${a} ${wh.cx} ${wh.cy})`} />
            ))}
            <circle cx={wh.cx} cy={wh.cy} r={wh.r * 0.14} fill="#2b2e33" />
          </g>
          <circle data-rig="blur" cx={wh.cx} cy={wh.cy} r={wh.r * 0.62} fill={`url(#m-${uid})`} opacity={0} />
        </g>
      ))}
    </svg>
  );
}
