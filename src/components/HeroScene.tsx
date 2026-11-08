/**
 * Illustrated background banners for the service-page heroes, drawn as inline SVG
 * (sharp at any size, no image download). Each service gets its own scene:
 *
 *   city     Hyderabad skyline and the Charminar (Cars)
 *   highway  Hills, temple gopuram and trees (Passenger)
 *   port     Warehouses, container stacks and gantry cranes (Trucks)
 *   site     Tower cranes and a building going up (Heavy equipment)
 *   street   City street with lamp posts (Drivers)
 *
 * Two looks, picked by the "Hero style" site setting:
 *   light  daytime: sun, clouds, pale skyline, sandstone landmarks (default)
 *   dark   night: moon, stars, lit and twinkling windows, glowing lamps
 *
 * The road is drawn by PageHero and never moves.
 * Buildings come from a seeded random generator, so server and browser render the same.
 */
export type SceneId = "city" | "highway" | "port" | "site" | "street";
export type HeroTheme = "light" | "dark";

const W = 1440;
const H = 520;

type Palette = {
  night: boolean;
  far: string;
  near: string;
  /** Windows: colour, minimum opacity, chance a window is shown. */
  glass: string;
  glassMin: number;
  windowChance: number;
  landmark: string;
  landmarkDetail: string;
  landmarkLine: string;
  hillsFar: string;
  hillsNear: string;
  trees: string;
  gantry: string;
  warehouse: string;
  door: string;
  containerOpacity: number;
  frame: string;
  tower: string;
  mounds: string;
  lamp: string;
  overlay: string;
};

const PALETTES: Record<HeroTheme, Palette> = {
  light: {
    night: false,
    far: "#E4E7EC",
    near: "#D5D9E0",
    glass: "#B9CCE2",
    glassMin: 0.5,
    windowChance: 0.45,
    landmark: "#DCC7A3",
    landmarkDetail: "#B99D70",
    landmarkLine: "#B89A6A",
    hillsFar: "#E9E3D8",
    hillsNear: "#DDE5D6",
    trees: "#BFCDB5",
    gantry: "#9DA5B2",
    warehouse: "#CBD0D8",
    door: "#DADEE4",
    containerOpacity: 0.5,
    frame: "#C3C8D0",
    tower: "#E7B23A",
    mounds: "#E3D3BE",
    lamp: "#A9B0BB",
    overlay: "bg-[linear-gradient(90deg,rgba(255,250,244,0.92)_0%,rgba(255,250,244,0.6)_36%,rgba(255,250,244,0)_66%)]",
  },
  dark: {
    night: true,
    far: "#26272e",
    near: "#191a20",
    glass: "#FDB022",
    glassMin: 0.35,
    windowChance: 0.2,
    landmark: "#15161b",
    landmarkDetail: "#0e0f13",
    landmarkLine: "#FDB022",
    hillsFar: "#2a2328",
    hillsNear: "#1f1c20",
    trees: "#141418",
    gantry: "#2c2e36",
    warehouse: "#1e1f25",
    door: "#0f1014",
    containerOpacity: 0.75,
    frame: "#24252c",
    tower: "#2f313a",
    mounds: "#211d1a",
    lamp: "#2e3038",
    overlay: "bg-[linear-gradient(90deg,rgba(14,15,17,0.92)_0%,rgba(14,15,17,0.6)_38%,rgba(14,15,17,0)_70%)]",
  },
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A row of buildings with windows (lit and twinkling at night). */
function Skyline({ p, seed, minH, maxH, color, windows = true, from = 0, to = W, gap = 4 }: { p: Palette; seed: number; minH: number; maxH: number; color: string; windows?: boolean; from?: number; to?: number; gap?: number }) {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  // Windows are merged into one path per brightness step (a handful of elements instead of
  // hundreds); only twinkling night windows stay separate so they can animate.
  const lit = new Map<number, string[]>();
  let x = from - 20;
  let i = 0;
  while (x < to) {
    const w = 38 + r() * 70;
    const h = minH + r() * (maxH - minH);
    const y = H - h;
    out.push(<rect key={`b${i}`} x={x} y={y} width={w} height={h} fill={color} />);
    if (r() > 0.75) out.push(<rect key={`a${i}`} x={x + w / 2 - 1} y={y - 18} width={2} height={18} fill={color} />);
    if (windows) {
      for (let wy = y + 12; wy < H - 14; wy += 14) {
        for (let wx = x + 7; wx < x + w - 9; wx += 11) {
          const v = r();
          if (v <= 1 - p.windowChance) continue;
          const alpha = p.glassMin + r() * 0.45;
          if (p.night && v > 0.97) {
            out.push(<rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width={4} height={6} fill={p.glass} opacity={alpha} className="scene-twinkle" />);
            continue;
          }
          const step = Math.round(alpha * 10) / 10;
          const cells = lit.get(step) ?? [];
          cells.push(`M${wx.toFixed(1)} ${wy.toFixed(1)}h4v6h-4z`);
          lit.set(step, cells);
        }
      }
    }
    x += w + gap;
    i++;
  }
  lit.forEach((cells, step) => out.push(<path key={`w${step}`} d={cells.join("")} fill={p.glass} opacity={step} />));
  return <g>{out}</g>;
}

const Sun = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r={90} fill="url(#hs-sunglow)" />
    <circle cx={x} cy={y} r={30} fill="#FDC24A" />
  </g>
);

const Moon = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r={70} fill="url(#hs-moonglow)" />
    <circle cx={x} cy={y} r={22} fill="#FFE7B3" opacity={0.9} />
  </g>
);

/** Sun and clouds by day, moon and stars by night. */
function Sky({ p, seed, x, y, body = true }: { p: Palette; seed: number; x: number; y: number; body?: boolean }) {
  const r = rng(seed);
  if (p.night)
    return (
      <>
        <g fill="#fff">
          {Array.from({ length: 36 }, (_, i) => (
            <circle key={i} cx={r() * W} cy={r() * 220} r={r() * 1.3 + 0.3} opacity={0.25 + r() * 0.5} className={i % 5 === 0 ? "scene-twinkle" : undefined} style={{ animationDelay: `${(i % 7) * 0.6}s` }} />
          ))}
        </g>
        {body && <Moon x={x} y={y} />}
      </>
    );
  return (
    <>
      <g fill="#FFFFFF" opacity={0.9}>
        {Array.from({ length: 4 }, (_, i) => {
          const cx = 120 + i * 340 + r() * 120;
          const cy = 50 + r() * 90;
          const s = 0.7 + r() * 0.6;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`}>
              <ellipse cx={0} cy={0} rx={60} ry={16} />
              <ellipse cx={-22} cy={-10} rx={26} ry={18} />
              <ellipse cx={16} cy={-14} rx={30} ry={22} />
            </g>
          );
        })}
      </g>
      {body && <Sun x={x} y={y} />}
    </>
  );
}

/** Charminar silhouette (four minarets, arched gallery). */
function Charminar({ p, x, s = 1 }: { p: Palette; x: number; s?: number }) {
  const color = p.landmark;
  const m = (cx: number) => (
    <g key={cx}>
      <rect x={cx - 7} y={-250} width={14} height={250} fill={color} />
      {[-200, -150, -100].map((y) => <rect key={y} x={cx - 11} y={y} width={22} height={6} rx={2} fill={color} />)}
      <path d={`M${cx - 9} -250 Q${cx - 10} -275 ${cx} -288 Q${cx + 10} -275 ${cx + 9} -250 Z`} fill={color} />
      <rect x={cx - 1} y={-300} width={2} height={14} fill={color} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${H}) scale(${s})`}>
      <path
        fillRule="evenodd"
        fill={color}
        d="M-92 0 V-150 H92 V0 Z M-70 0 V-70 Q-70 -110 -45 -118 Q-20 -110 -20 -70 V0 Z M-16 0 V-80 Q-16 -128 0 -136 Q16 -128 16 -80 V0 Z M20 0 V-70 Q20 -110 45 -118 Q70 -110 70 -70 V0 Z"
      />
      <rect x={-96} y={-168} width={192} height={18} fill={color} />
      <rect x={-84} y={-196} width={168} height={28} fill={color} />
      {[-60, -30, 0, 30, 60].map((cx) => <path key={cx} d={`M${cx - 9} -196 V-206 Q${cx} -216 ${cx + 9} -206 V-196 Z`} fill={color} />)}
      {[-84, 84].map(m)}
      <rect x={-96} y={-150} width={192} height={2} fill={p.landmarkLine} opacity={p.night ? 0.35 : 0.6} />
    </g>
  );
}

function Hills({ seed, y, amp, color, n = 4 }: { seed: number; y: number; amp: number; color: string; n?: number }) {
  const r = rng(seed);
  let d = `M0 ${H} L0 ${y}`;
  const step = W / n;
  for (let i = 0; i < n; i++) {
    const x1 = i * step + step / 2;
    const x2 = (i + 1) * step;
    d += ` Q${x1} ${y - amp * (0.5 + r())} ${x2} ${y - amp * r() * 0.4}`;
  }
  d += ` L${W} ${H} Z`;
  return <path d={d} fill={color} />;
}

/** South Indian temple gopuram: stepped tapering tower with a barrel-vault crown and finials. */
function Gopuram({ p, x, s = 1 }: { p: Palette; x: number; s?: number }) {
  const tiers = 7;
  const base = 150;
  const top = 64;
  const th = 30;
  const parts: React.ReactNode[] = [];
  for (let t = 0; t < tiers; t++) {
    const w = base - ((base - top) * t) / (tiers - 1);
    const y = -40 - (t + 1) * th;
    parts.push(<path key={t} d={`M${-w / 2} ${y + th} L${-w / 2 + 5} ${y} H${w / 2 - 5} L${w / 2} ${y + th} Z`} />);
    parts.push(<rect key={`l${t}`} x={-w / 2 + 3} y={y + th - 5} width={w - 6} height={2} fill={p.landmarkLine} opacity={0.18} />);
    for (let k = -1; k <= 1; k++) parts.push(<rect key={`n${t}${k}`} x={k * (w / 3.2) - 3} y={y + 9} width={6} height={12} rx={3} fill={p.landmarkDetail} />);
  }
  const crownY = -40 - tiers * th;
  return (
    <g transform={`translate(${x} ${H}) scale(${s})`} fill={p.landmark}>
      <rect x={-84} y={-40} width={168} height={40} />
      {parts}
      <path d={`M-40 ${crownY} V${crownY - 14} Q0 ${crownY - 52} 40 ${crownY - 14} V${crownY} Z`} />
      {[-24, -8, 8, 24].map((cx) => <path key={cx} d={`M${cx - 3} ${crownY - 30} Q${cx} ${crownY - 52} ${cx + 3} ${crownY - 30} Z`} transform={`translate(0 ${Math.abs(cx) > 10 ? 6 : -4})`} />)}
      <path d="M-16 0 V-26 Q0 -42 16 -26 V0 Z" fill={p.landmarkDetail} />
    </g>
  );
}

function GantryCrane({ x, s = 1, color }: { x: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${H}) scale(${s})`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="square">
      <path d="M-60 0 V-210 M60 0 V-210 M-60 -120 H60 M-60 -210 H60 M-60 -120 L60 -210" />
      <path d="M-160 -230 H190 M-160 -230 L-60 -210 M190 -230 L60 -210" strokeWidth={8} />
      <path d="M100 -230 V-150" strokeWidth={2} />
      <rect x={88} y={-150} width={24} height={10} fill={color} stroke="none" />
      <circle cx={-150} cy={-232} r={3} fill="#E8540C" stroke="none" className="scene-twinkle" />
    </g>
  );
}

function Containers({ p, seed, x, cols, rows }: { p: Palette; seed: number; x: number; cols: number; rows: number }) {
  const r = rng(seed);
  const colors = ["#8a3a10", "#1f3a5c", "#4a4f58", "#7a5a10", "#2f5a3f", "#5c1f1f"];
  const out: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    const h = 1 + Math.floor(r() * rows);
    for (let k = 0; k < h; k++) {
      const col = colors[Math.floor(r() * colors.length)];
      out.push(
        <g key={`${c}-${k}`}>
          <rect x={x + c * 92} y={H - (k + 1) * 34} width={88} height={32} fill={col} opacity={p.containerOpacity} />
          {[18, 36, 54, 72].map((d) => <rect key={d} x={x + c * 92 + d} y={H - (k + 1) * 34 + 3} width={2} height={26} fill="#000" opacity={p.night ? 0.18 : 0.1} />)}
        </g>,
      );
    }
  }
  return <g>{out}</g>;
}

function Warehouse({ p, x, w, h }: { p: Palette; x: number; w: number; h: number }) {
  const teeth = Math.floor(w / 60);
  let d = `M${x} ${H} V${H - h}`;
  for (let i = 0; i < teeth; i++) d += ` l40 -26 v26 l20 0`;
  d += ` V${H} Z`;
  return (
    <g>
      <path d={d} fill={p.warehouse} />
      {Array.from({ length: Math.floor(w / 90) }, (_, i) => <rect key={i} x={x + 20 + i * 90} y={H - 60} width={56} height={60} fill={p.door} />)}
      <rect x={x} y={H - h + 12} width={w} height={3} fill={p.glass} opacity={0.25} />
    </g>
  );
}

function TowerCrane({ p, x, mast, jib, flip = false, color }: { p: Palette; x: number; mast: number; jib: number; flip?: boolean; color: string }) {
  const dir = flip ? -1 : 1;
  const top = H - mast;
  const lattice: string[] = [];
  for (let y = H; y > top; y -= 24) lattice.push(`M${x - 9} ${y} L${x + 9} ${y - 24} M${x + 9} ${y} L${x - 9} ${y - 24}`);
  return (
    <g stroke={color} fill="none">
      <path d={`M${x - 9} ${H} V${top} M${x + 9} ${H} V${top}`} strokeWidth={4} />
      <path d={lattice.join(" ")} strokeWidth={1.5} />
      <path d={`M${x - dir * 80} ${top} H${x + dir * jib}`} strokeWidth={7} />
      <path d={`M${x} ${top - 40} L${x + dir * jib * 0.7} ${top} M${x} ${top - 40} L${x - dir * 80} ${top} M${x} ${top} V${top - 40}`} strokeWidth={2} />
      <rect x={flip ? x + 50 : x - 90} y={top} width={40} height={22} fill={color} stroke="none" />
      <path d={`M${x + dir * jib * 0.6} ${top} V${top + 120}`} strokeWidth={1.5} />
      <rect x={x + dir * jib * 0.6 - 9} y={top + 120} width={18} height={14} fill={p.night ? "#FDB022" : p.glass} opacity={0.55} stroke="none" />
      <circle cx={x + dir * jib} cy={top - 3} r={3.5} fill="#E8540C" stroke="none" className="scene-twinkle" />
    </g>
  );
}

function Frame({ p, x, floors, bays }: { p: Palette; x: number; floors: number; bays: number }) {
  const fw = 52;
  const fh = 36;
  const w = bays * fw;
  const top = H - floors * fh;
  const built = Math.floor(floors * 0.55) * fh;
  const lines: string[] = [];
  for (let f = 0; f <= floors; f++) lines.push(`M${x} ${H - f * fh} H${x + w}`);
  for (let b = 0; b <= bays; b++) lines.push(`M${x + b * fw} ${H} V${top}`);
  return (
    <g>
      <rect x={x} y={H - built} width={w} height={built} fill={p.frame} opacity={0.8} />
      <path d={lines.join(" ")} stroke={p.frame} strokeWidth={4} />
      <path d={`M${x} ${top} L${x + w} ${H - built}`} stroke={p.night ? "#FDB022" : p.glass} strokeWidth={1} opacity={0.3} />
    </g>
  );
}

function Lamp({ p, x, h = 150 }: { p: Palette; x: number; h?: number }) {
  return (
    <g>
      {p.night && <circle cx={x + 24} cy={H - h + 8} r={60} fill="url(#hs-lampglow)" />}
      <path d={`M${x} ${H} V${H - h} Q${x} ${H - h - 10} ${x + 24} ${H - h}`} stroke={p.lamp} strokeWidth={4} fill="none" />
      {p.night ? (
        <rect x={x + 16} y={H - h} width={18} height={6} rx={2} fill="#FDB022" />
      ) : (
        <rect x={x + 16} y={H - h} width={18} height={6} rx={2} fill="#EEF1F5" stroke={p.lamp} strokeWidth={1.5} />
      )}
    </g>
  );
}

function Trees({ seed, n, color }: { seed: number; n: number; color: string }) {
  const r = rng(seed);
  return (
    <g fill={color}>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * W;
        const s = 0.6 + r() * 0.8;
        return <path key={i} d={`M${x} ${H} V${H - 30 * s} M${x - 16 * s} ${H - 26 * s} Q${x} ${H - 80 * s} ${x + 16 * s} ${H - 26 * s} Z`} stroke={color} strokeWidth={3} />;
      })}
    </g>
  );
}

function Scene({ id, p }: { id: SceneId; p: Palette }) {
  switch (id) {
    case "city":
      return (
        <>
          <Sky p={p} seed={3} x={1230} y={95} />
          <Skyline p={p} seed={11} minH={90} maxH={230} color={p.far} />
          <Skyline p={p} seed={29} minH={40} maxH={120} color={p.near} gap={10} to={850} />
          <Skyline p={p} seed={31} minH={40} maxH={110} color={p.near} gap={10} from={1120} />
          <Charminar p={p} x={985} s={1.1} />
        </>
      );
    case "highway":
      return (
        <>
          <Sky p={p} seed={5} x={260} y={110} body={!p.night} />
          <Hills seed={7} y={300} amp={120} color={p.hillsFar} n={3} />
          <Hills seed={9} y={430} amp={60} color={p.hillsNear} n={5} />
          <Gopuram p={p} x={1070} s={1.05} />
          <Trees seed={13} n={26} color={p.trees} />
        </>
      );
    case "port":
      return (
        <>
          <Sky p={p} seed={8} x={0} y={0} body={false} />
          <Skyline p={p} seed={17} minH={60} maxH={140} color={p.far} windows={false} />
          <GantryCrane x={430} s={1.1} color={p.gantry} />
          <GantryCrane x={1120} s={1.25} color={p.gantry} />
          <Warehouse p={p} x={60} w={420} h={110} />
          <Containers p={p} seed={21} x={560} cols={9} rows={4} />
        </>
      );
    case "site":
      return (
        <>
          <Sky p={p} seed={4} x={0} y={0} body={false} />
          <Skyline p={p} seed={33} minH={50} maxH={120} color={p.far} windows={false} />
          <Frame p={p} x={760} floors={9} bays={6} />
          <TowerCrane p={p} x={720} mast={420} jib={420} color={p.tower} />
          <TowerCrane p={p} x={1300} mast={330} jib={300} flip color={p.tower} />
          <path d={`M0 ${H} Q160 ${H - 60} 330 ${H} Z M420 ${H} Q520 ${H - 40} 640 ${H} Z`} fill={p.mounds} />
        </>
      );
    case "street":
      return (
        <>
          <Sky p={p} seed={6} x={1180} y={p.night ? 70 : 90} />
          <Skyline p={p} seed={41} minH={120} maxH={260} color={p.far} />
          <Skyline p={p} seed={47} minH={60} maxH={150} color={p.near} gap={14} />
          {[140, 520, 900, 1280].map((x) => <Lamp key={x} p={p} x={x} />)}
        </>
      );
  }
}

/** Fills its wrapper; the wrapper's bottom edge is the horizon (PageHero anchors it to the vehicle). */
export default function HeroScene({ id, theme = "light" }: { id: SceneId; theme?: HeroTheme }) {
  const p = PALETTES[theme];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {p.night && <div className="absolute inset-x-0 bottom-0 h-[80%] bg-[radial-gradient(70%_60%_at_65%_100%,rgba(244,122,22,0.22),transparent_70%)]" />}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="hs-sunglow">
            <stop offset="0" stopColor="#FDB022" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FDB022" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hs-moonglow">
            <stop offset="0" stopColor="#FFE7B3" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFE7B3" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hs-lampglow">
            <stop offset="0" stopColor="#FDB022" stopOpacity="0.45" />
            <stop offset="1" stopColor="#FDB022" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Scene id={id} p={p} />
      </svg>
      {/* keep the title side readable */}
      <div className={`absolute inset-0 ${p.overlay}`} />
    </div>
  );
}
