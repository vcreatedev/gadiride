import { forwardRef } from "react";

/**
 * Professional chauffeur, front-facing, arms at his sides: peaked cap with gold
 * badge, tailored dark suit, white shirt, tie, white gloves.
 * The right arm (`data-arm="wave"`) pivots at the shoulder (ARM_PIVOT) to wave.
 * viewBox 0 0 100 260; feet rest on y = 258.
 */
export const ARM_PIVOT = "75 77";

const DriverFigure = forwardRef<SVGSVGElement, { className?: string; style?: React.CSSProperties }>(function DriverFigure({ className, style }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 100 260" className={className} style={style} aria-hidden="true" overflow="visible">
      <defs>
        <linearGradient id="df-suit" x1="0" x2="1">
          <stop offset="0" stopColor="#141a29" />
          <stop offset="0.45" stopColor="#273049" />
          <stop offset="1" stopColor="#121726" />
        </linearGradient>
        <linearGradient id="df-sleeve" x1="0" x2="1">
          <stop offset="0" stopColor="#1a2133" />
          <stop offset="1" stopColor="#2a3350" />
        </linearGradient>
        <linearGradient id="df-trouser" x1="0" x2="1">
          <stop offset="0" stopColor="#11151f" />
          <stop offset="0.5" stopColor="#222a3d" />
          <stop offset="1" stopColor="#0f131c" />
        </linearGradient>
        <radialGradient id="df-skin" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#D9A47A" />
          <stop offset="0.7" stopColor="#B97E55" />
          <stop offset="1" stopColor="#9A6440" />
        </radialGradient>
        <linearGradient id="df-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3247" />
          <stop offset="1" stopColor="#141927" />
        </linearGradient>
        <radialGradient id="df-shadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="50" cy="258" rx="30" ry="4.5" fill="url(#df-shadow)" />

      {/* shoes */}
      <path d="M33 249 Q33 245 38 245 L48 245 Q50 252 49 258 L31 258 Q29 253 33 249 Z" fill="#07080b" />
      <path d="M67 249 Q67 245 62 245 L52 245 Q50 252 51 258 L69 258 Q71 253 67 249 Z" fill="#07080b" />

      {/* trousers */}
      <path d="M31 150 L35 247 L49 247 L50 162 L51 247 L65 247 L69 150 Z" fill="url(#df-trouser)" />
      <path d="M42 165 L42 245 M58 165 L58 245" stroke="#2f3850" strokeWidth="0.8" />

      {/* jacket */}
      <path d="M21 74 Q23 62 37 58 L50 66 L63 58 Q77 62 79 74 L81 154 Q66 162 50 162 Q34 162 19 154 Z" fill="url(#df-suit)" />
      <path d="M41 59 L50 98 L59 59 Q50 64 41 59 Z" fill="#F7F8FA" />
      <path d="M47.5 64 L52.5 64 L51.5 69 L48.5 69 Z" fill="#7a2b0c" />
      <path d="M48.5 69 L51.5 69 L54 93 L50 100 L46 93 Z" fill="#8E370B" />
      <path d="M37 58 L50 104 L43 82 L36 76 L40 70 Z" fill="#30395a" />
      <path d="M63 58 L50 104 L57 82 L64 76 L60 70 Z" fill="#2b3452" />
      <circle cx="50" cy="118" r="1.6" fill="#C9A227" />
      <circle cx="50" cy="132" r="1.6" fill="#C9A227" />
      <path d="M62 86 h8" stroke="#F47A16" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 104 L50 158" stroke="#0e1220" strokeWidth="0.8" />

      {/* left arm, relaxed at his side */}
      <path d="M22 72 Q13 110 19 146 L28 146 Q27 112 31 80 Z" fill="url(#df-sleeve)" />
      <path d="M19.5 145 h8.5" stroke="#F7F8FA" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="23.5" cy="152" rx="5.2" ry="6.8" fill="#F4F5F7" />

      {/* right arm: waves */}
      <g data-arm="wave">
        <path d="M78 72 Q87 110 81 146 L72 146 Q73 112 69 80 Z" fill="url(#df-sleeve)" />
        <path d="M72 145 h8.5" stroke="#F7F8FA" strokeWidth="2.2" strokeLinecap="round" />
        <g data-hand>
          <ellipse cx="76.5" cy="152" rx="5.4" ry="7" fill="#FFFFFF" />
          <path d="M73 147 v-4 M75.5 146.5 v-5 M78 146.5 v-5 M80.5 147.5 v-3.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </g>

      {/* neck + head */}
      <path d="M44 46 L56 46 L57 59 Q50 63 43 59 Z" fill="url(#df-skin)" />
      <ellipse cx="37.5" cy="37" rx="2.6" ry="4" fill="#B47A52" />
      <ellipse cx="62.5" cy="37" rx="2.6" ry="4" fill="#B47A52" />
      <path d="M38 30 Q38 50 50 53 Q62 50 62 30 Q62 22 50 22 Q38 22 38 30 Z" fill="url(#df-skin)" />
      <path d="M38 30 Q38 25 41 24 L41 33 Q39 32 38 30 Z M62 30 Q62 25 59 24 L59 33 Q61 32 62 30 Z" fill="#1b1410" />
      <path d="M42.5 31.5 q3 -1.5 5.5 0 M52 31.5 q2.5 -1.5 5.5 0" stroke="#2a1d14" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <ellipse cx="45.3" cy="34.6" rx="1.2" ry="1" fill="#1b130e" />
      <ellipse cx="54.7" cy="34.6" rx="1.2" ry="1" fill="#1b130e" />
      <path d="M50 35 Q48.6 40.5 49.2 41.5 Q50 42.2 51.2 41.4" stroke="#8a5534" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M45.5 44.2 Q50 46 54.5 44.2" stroke="#2a1d14" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* friendly smile */}
      <path d="M46 47 Q50 50 54 47" stroke="#6d3b22" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* peaked chauffeur cap */}
      <path d="M33.5 25 Q33 12 50 10.5 Q67 12 66.5 25 Z" fill="url(#df-cap)" />
      <rect x="36" y="22" width="28" height="5.5" rx="1.5" fill="#0c0f18" />
      <path d="M37 22.8 h26" stroke="#C9A227" strokeWidth="0.8" />
      <circle cx="50" cy="18" r="3" fill="#E1B12C" stroke="#9c7a17" strokeWidth="0.6" />
      <path d="M36 27 Q50 34 64 27 L63 29.5 Q50 37 37 29.5 Z" fill="#06070a" />
    </svg>
  );
});

export default DriverFigure;
