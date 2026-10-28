/** Layered night-road scenery for the hero and story bands. Pure SVG, no image requests. */
export function Skyline({ className = "" }: { className?: string }) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const blocks: { x: number; w: number; h: number }[] = [];
  for (let x = 0; x < 2400; ) {
    const w = 40 + rnd() * 90;
    blocks.push({ x, w, h: 60 + rnd() * 200 });
    x += w + rnd() * 14;
  }
  return (
    <svg viewBox="0 0 2400 300" preserveAspectRatio="none" className={className} aria-hidden="true">
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={300 - b.h} width={b.w} height={b.h} fill="#1A1C20" />
          {i % 3 === 0 &&
            Array.from({ length: Math.floor(b.h / 26) }, (_, r) => (
              <rect key={r} x={b.x + 10 + ((r * 13) % Math.max(b.w - 24, 1))} y={300 - b.h + 14 + r * 26} width={6} height={8} fill="#F2B866" opacity={0.18 + ((r * 7) % 5) / 20} />
            ))}
        </g>
      ))}
    </svg>
  );
}

export function Lamps({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 3600 220" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="lamp-glow">
          <stop offset="0" stopColor="#FFC98A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFC98A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }, (_, i) => {
        const x = 120 + i * 300;
        return (
          <g key={i}>
            <circle cx={x + 34} cy={34} r={46} fill="url(#lamp-glow)" />
            <path d={`M${x},220 L${x},30 Q${x},18 ${x + 14},18 L${x + 40},18`} stroke="#2B2D31" strokeWidth={5} fill="none" />
            <rect x={x + 26} y={14} width={20} height={8} rx={3} fill="#FFE2B5" />
          </g>
        );
      })}
    </svg>
  );
}

export function Road({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1c20] to-[#0e0f11]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div data-dash className="road-dash absolute left-0 top-[46%] h-[3px] w-[300%] opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black/40" />
    </div>
  );
}
