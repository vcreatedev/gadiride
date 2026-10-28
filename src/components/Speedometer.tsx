"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type SpeedoHandle = { set: (kmh: number) => void; ticks: () => Element[]; root: SVGSVGElement };
const CX = 200, CY = 210, R = 160, MAX = 240;
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)] as const;
};
const arc = (from: number, to: number, r: number) => {
  const [x1, y1] = pt(from, r);
  const [x2, y2] = pt(to, r);
  return `M${x1},${y1} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2},${y2}`;
};
const ARC_LEN = (R - 6) * ((MAX * Math.PI) / 180);

/** Instrument-cluster style speedometer. 1 degree of sweep = 1 km/h. */
const Speedometer = forwardRef<SpeedoHandle, { className?: string; label?: string; compact?: boolean }>(function Speedometer(
  { className, label = "km/h", compact = false },
  ref,
) {
  const svg = useRef<SVGSVGElement>(null);
  const needle = useRef<SVGGElement>(null);
  const prog = useRef<SVGPathElement>(null);
  const num = useRef<SVGTextElement>(null);

  useImperativeHandle(ref, () => ({
    root: svg.current!,
    ticks: () => Array.from(svg.current!.querySelectorAll("[data-tick]")),
    set: (kmh: number) => {
      const v = Math.max(0, Math.min(MAX, kmh));
      needle.current?.setAttribute("transform", `rotate(${v - 120} ${CX} ${CY})`);
      if (prog.current) prog.current.style.strokeDashoffset = String(ARC_LEN * (1 - v / MAX));
      if (num.current) num.current.textContent = String(Math.round(v)).padStart(3, "0");
    },
  }));

  const ticks = [];
  for (let v = 0; v <= MAX; v += compact ? 20 : 10) {
    const major = v % 20 === 0;
    const red = v >= 200;
    const [x1, y1] = pt(v - 120, R);
    const [x2, y2] = pt(v - 120, R - (major ? 22 : 12));
    ticks.push(<line key={v} data-tick x1={x1} y1={y1} x2={x2} y2={y2} stroke={red ? "#F2611D" : "#ffffff"} strokeWidth={major ? 3 : 1.5} strokeLinecap="round" opacity={0.25} />);
    if (major && !compact) {
      const [tx, ty] = pt(v - 120, R - 44);
      ticks.push(<text key={"t" + v} data-tick x={tx} y={ty + 6} textAnchor="middle" fill={red ? "#F2611D" : "#E9EBEF"} fontSize="16" fontFamily="Barlow Condensed, sans-serif" fontWeight={700} opacity={0.25}>{v}</text>);
    }
  }

  return (
    <svg ref={svg} viewBox="0 0 400 412" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="dial-face">
          <stop offset="0" stopColor="#25272C" />
          <stop offset="1" stopColor="#111214" />
        </radialGradient>
        <filter id="dial-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={CX} cy={CY} r={R + 22} fill="url(#dial-face)" stroke="#2B2D31" strokeWidth={2} />
      <path d={arc(-120, 120, R - 6)} fill="none" stroke="#2B2D31" strokeWidth={6} strokeLinecap="round" />
      <path d={arc(80, 120, R + 10)} fill="none" stroke="#F2611D" strokeOpacity={0.5} strokeWidth={3} />
      <path ref={prog} d={arc(-120, 120, R - 6)} fill="none" stroke="#F2611D" strokeWidth={6} strokeLinecap="round" filter="url(#dial-glow)" style={{ strokeDasharray: ARC_LEN, strokeDashoffset: ARC_LEN }} />
      {ticks}
      {!compact && (
        <>
          <text x={CX} y={CY + 150} textAnchor="middle" fill="#ffffff" fontSize="18" letterSpacing="3" fontFamily="Barlow Condensed, sans-serif" fontWeight={800}>GADIRIDE</text>
          <text ref={num} x={CX} y={CY + 82} textAnchor="middle" fill="#ffffff" fontSize="46" fontFamily="IBM Plex Mono, monospace" fontWeight={500}>000</text>
          <text x={CX} y={CY + 104} textAnchor="middle" fill="#8A8F98" fontSize="13" fontFamily="IBM Plex Mono, monospace">{label}</text>
        </>
      )}
      <g ref={needle} transform={`rotate(-120 ${CX} ${CY})`}>
        <path d={`M${CX - 4},${CY + 18} L${CX - 1.2},${CY - R + 18} L${CX + 1.2},${CY - R + 18} L${CX + 4},${CY + 18} Z`} fill="#F2611D" filter="url(#dial-glow)" />
      </g>
      <circle cx={CX} cy={CY} r={13} fill="#1E1F22" stroke="#F2611D" strokeWidth={2} />
    </svg>
  );
});
export default Speedometer;
