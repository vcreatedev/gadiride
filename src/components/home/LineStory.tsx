"use client";
import { useEffect, useRef, useState } from "react";
import VehicleSvg from "../VehicleSvg";
import Speedometer, { type SpeedoHandle } from "../Speedometer";
import { ART, type ArtId } from "@/data/vehicleArt";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, isSmallScreen } from "@/lib/motion";
import { scrollToTarget } from "@/lib/lenis";

type Chapter = { n: string; key: string; title: string; copy: string; art?: ArtId; readout: string };
const CHAPTERS: Chapter[] = [
  { n: "01", key: "Choose", title: "Start with what you need", copy: "A trip, a load or a job site. Pick the vehicle group and we take it from there.", readout: "Route" },
  { n: "02", key: "Cars", title: "Cars for every day", copy: "Hatchbacks for the city, sedans for the airport, SUVs for family trips and luxury cars for weddings. Self drive or with a driver.", art: "suv", readout: "Cars" },
  { n: "03", key: "Passenger", title: "Seats for the whole group", copy: "Tempo travellers, minibuses and buses for functions, tours and staff transport.", art: "van", readout: "Groups" },
  { n: "04", key: "Logistics", title: "Loads, moved", copy: "Pickups and trucks for shop stock, house shifting and inter-city goods.", art: "truck", readout: "Goods" },
  { n: "05", key: "Heavy equipment", title: "Machines for the site", copy: "Backhoe loaders (JCB) by the hour or the day, with or without an operator.", art: "jcb", readout: "Site work" },
  { n: "06", key: "Book", title: "One message away", copy: "Send your details on WhatsApp and get a quote from our team.", readout: "Ready" },
];
const N = CHAPTERS.length;

function Dimensions({ art }: { art: ArtId }) {
  const a = ART[art];
  const [x, y, w, h] = a.viewBox;
  const fs = w * 0.026;
  const top = Math.min(...a.body.map((b) => Number(b.d.match(/,(-?\d+)/g)?.map((m) => +m.slice(1)).reduce((p, c) => Math.min(p, c), 999))));
  const gy = a.groundY + h * 0.08;
  const rx = x + w + w * 0.03;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} overflow="visible" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
      <g data-tier="6" stroke="#ff5a1f" strokeWidth={w * 0.002}>
        <path d={`M${x + 10},${gy} L${x + w - 10},${gy}`} />
        <path d={`M${x + 10},${gy - h * 0.04} L${x + 10},${gy + h * 0.04} M${x + w - 10},${gy - h * 0.04} L${x + w - 10},${gy + h * 0.04}`} />
        <path d={`M${rx},${top} L${rx},${a.groundY}`} />
        <path d={`M${rx - w * 0.012},${top} L${rx + w * 0.012},${top} M${rx - w * 0.012},${a.groundY} L${rx + w * 0.012},${a.groundY}`} />
      </g>
      <g data-tier="6t" fill="#9ca3af" fontFamily="IBM Plex Mono, monospace" fontSize={fs}>
        <text x={x + w / 2} y={gy + fs * 1.4} textAnchor="middle">≈ {((w - 20) * 10).toLocaleString("en-IN")} mm</text>
        <text x={rx + fs * 0.6} y={(top + a.groundY) / 2} dominantBaseline="middle">≈ {((a.groundY - top) * 10).toLocaleString("en-IN")} mm</text>
      </g>
    </svg>
  );
}

function RouteMap() {
  return (
    <svg viewBox="0 0 800 400" className="h-full w-full" fill="none" aria-hidden="true">
      <g data-tier="1" stroke="#525866" strokeWidth={1}>
        {Array.from({ length: 9 }, (_, i) => <path key={"h" + i} d={`M0,${i * 50} L800,${i * 50}`} />)}
        {Array.from({ length: 17 }, (_, i) => <path key={"v" + i} d={`M${i * 50},0 L${i * 50},400`} />)}
      </g>
      <g data-tier="2" stroke="#9ca3af" strokeWidth={2}>
        <path d="M40,330 C180,320 220,200 360,210 S560,120 760,80" />
        <path d="M60,90 C200,110 280,260 420,270 S640,330 760,300" />
      </g>
      <g data-tier="5" stroke="#ff5a1f" strokeWidth={2.5}>
        <circle cx={40} cy={330} r={9} /><circle cx={760} cy={80} r={9} /><circle cx={360} cy={210} r={6} /><circle cx={760} cy={300} r={9} />
        <path d="M40,330 C180,320 220,200 360,210 S560,120 760,80" strokeDasharray="0" />
      </g>
    </svg>
  );
}

/** Pinned, scrubbed blueprint story: each vehicle group draws itself in tiers while a HUD gauge tracks progress. */
export default function LineStory() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const gauge = useRef<SpeedoHandle>(null);
  const bar = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  useGSAP(() => {
    if (reduced || !pin.current) return;
    const q = gsap.utils.selector(root);
    const scenes = q("[data-scene]");
    const texts = q("[data-text]");
    const tiers = (el: Element, t: string) => Array.from(el.querySelectorAll(`[data-tier="${t}"] > *, [data-tier="${t}"] g > *`)).filter((n) => n.tagName !== "g");

    scenes.forEach((s, i) => {
      gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 });
      ["1", "2", "3", "4", "5", "6"].forEach((t) => gsap.set(tiers(s, t), { drawSVG: "0%" }));
      gsap.set(s.querySelectorAll('[data-tier="6t"]'), { autoAlpha: 0 });
    });
    gsap.set(texts, { autoAlpha: 0, y: 20 });
    gsap.set(texts[0], { autoAlpha: 1, y: 0 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    scenes.forEach((s, i) => {
      const t0 = i;
      if (i > 0) {
        tl.to(scenes[i - 1], { autoAlpha: 0, scale: 0.96, duration: 0.12 }, t0 - 0.06)
          .to(texts[i - 1], { autoAlpha: 0, y: -20, duration: 0.1 }, t0 - 0.06)
          .fromTo(s, { autoAlpha: 0, scale: 1.02 }, { autoAlpha: 1, scale: 1, duration: 0.12 }, t0)
          .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.12 }, t0 + 0.02);
      }
      const parts = ["1", "2", "3", "4", "5"].map((t) => tiers(s, t));
      const span = 0.78 / parts.length;
      parts.forEach((els, k) => els.length && tl.to(els, { drawSVG: "100%", duration: span, stagger: span / Math.max(els.length * 2, 1) }, t0 + 0.04 + k * span));
      const dims = tiers(s, "6");
      if (dims.length) {
        tl.to(dims, { drawSVG: "100%", duration: 0.1 }, t0 + 0.82).to(s.querySelectorAll('[data-tier="6t"]'), { autoAlpha: 1, duration: 0.06 }, t0 + 0.9);
      }
    });
    tl.to(q("[data-final-glow]"), { opacity: 1, duration: 0.2 }, N - 0.5);
    tl.set({}, {}, N);

    const small = isSmallScreen();
    st.current = ScrollTrigger.create({
      trigger: pin.current,
      start: "top top",
      end: `+=${small ? 3000 : 5200}`,
      pin: true,
      scrub: 1.2,
      animation: tl,
      onUpdate: (self) => {
        const p = self.progress;
        gauge.current?.set(p * 240);
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        const idx = Math.min(N - 1, Math.floor(p * N + 0.02));
        setActive((a) => (a === idx ? a : idx));
      },
    });
  }, { scope: root, dependencies: [reduced] });

  const go = (i: number) => {
    const s = st.current;
    if (!s) return;
    scrollToTarget(s.start + ((i + 0.5) / N) * (s.end - s.start), 0);
  };

  if (reduced) {
    return (
      <section className="section-y bg-[#07080a] text-white" aria-labelledby="story-title">
        <div className="container-x">
          <h2 id="story-title" className="h2 text-white">From hatchback to JCB<span className="text-brand-500">.</span></h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-2">
            {CHAPTERS.filter((c) => c.art).map((c) => (
              <li key={c.n}>
                <div className="relative aspect-[2/1]"><VehicleSvg art={c.art!} mode="line" className="h-full w-full" /></div>
                <h3 className="mt-4 font-head text-xl font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-ink-300">{c.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} id="story" className="relative bg-[#07080a] text-white" aria-labelledby="story-title">
      <div ref={pin} className="relative h-[100svh] overflow-hidden">
        {/* Technical grid and corner crosshairs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="border-r border-white/[0.04]" />)}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,transparent,rgba(0,0,0,0.6))]" />
        {["left-4 top-20", "right-4 top-20", "left-4 bottom-4", "right-4 bottom-4"].map((p) => (
          <span key={p} aria-hidden className={`absolute ${p} h-4 w-4 border-white/30 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:bg-white/30 after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:bg-white/30`} />
        ))}

        <h2 id="story-title" className="sr-only">From hatchback to JCB: the Gadiride range</h2>

        {/* Mobile progress */}
        <div className="absolute inset-x-4 top-[76px] h-[2px] bg-white/10 md:hidden"><div ref={bar} className="h-full origin-left scale-x-0 bg-brand-500" /></div>

        {/* Chapter navigation */}
        <nav aria-label="Story chapters" className="absolute left-6 top-1/2 hidden -translate-y-1/2 md:block lg:left-10">
          <ol className="relative space-y-5 border-l border-white/15 pl-6">
            {CHAPTERS.map((c, i) => (
              <li key={c.n} className="relative">
                <span aria-hidden className={`absolute -left-[29px] top-1.5 h-[9px] w-[9px] rounded-full transition-all duration-300 ${active === i ? "scale-125 bg-brand-500 shadow-[0_0_12px_rgba(242,97,29,.8)]" : active > i ? "bg-white/60" : "bg-white/20"}`} />
                <button type="button" onClick={() => go(i)} aria-current={active === i ? "step" : undefined} className={`font-mono text-[13px] transition-colors ${active === i ? "text-white" : "text-white/45 hover:text-white/80"}`}>
                  {c.n} // {c.key}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Stage */}
        <div className="absolute inset-x-4 top-[18%] bottom-[38%] md:left-[22%] md:right-[8%] md:top-[14%] md:bottom-[30%]">
          {CHAPTERS.map((c, i) => (
            <div key={c.n} data-scene className="absolute inset-0 flex items-center justify-center">
              {i === 0 && <div className="h-full w-full max-w-[760px]"><RouteMap /></div>}
              {c.art && (
                <div className="relative w-full" style={{ maxWidth: c.art === "truck" ? "820px" : c.art === "van" ? "720px" : "640px", aspectRatio: `${ART[c.art].viewBox[2]} / ${ART[c.art].viewBox[3]}` }}>
                  <VehicleSvg art={c.art} mode="line" className="absolute inset-0 h-full w-full" />
                  <Dimensions art={c.art} />
                </div>
              )}
              {i === N - 1 && (
                <div className="relative flex w-full max-w-[900px] items-end justify-center gap-[2%]">
                  {(["hatch", "suv", "van", "truck", "jcb"] as ArtId[]).map((a) => (
                    <div key={a} style={{ width: `${(ART[a].viewBox[2] / 3200) * 100}%`, aspectRatio: `${ART[a].viewBox[2]} / ${ART[a].viewBox[3]}` }} className="relative">
                      <VehicleSvg art={a} mode="line" className="absolute inset-0 h-full w-full" />
                    </div>
                  ))}
                  <div data-final-glow aria-hidden className="pointer-events-none absolute -bottom-6 left-0 right-0 h-px bg-brand-500 opacity-0 shadow-[0_0_30px_8px_rgba(242,97,29,.55)]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Copy */}
        <div className="absolute bottom-[10%] left-4 right-4 md:bottom-[9%] md:left-[22%] md:right-[34%]">
          {CHAPTERS.map((c, i) => (
            <div key={c.n} data-text className="absolute bottom-0 left-0 right-0">
              <p className="font-mono text-[13px] text-brand-500">{c.n} // {c.key}</p>
              <h3 className="display mt-2 text-4xl text-white md:text-6xl">{c.title}</h3>
              <p className="mt-3 max-w-[48ch] text-ink-300">{c.copy}</p>
              {i === N - 1 && (
                <button type="button" onClick={() => scrollToTarget("#book", -100)} className="btn-primary mt-5">Get a quote</button>
              )}
            </div>
          ))}
        </div>

        {/* HUD gauge */}
        <div className="absolute bottom-20 right-4 hidden w-[180px] rounded-card border border-white/10 bg-black/40 p-3 backdrop-blur md:block lg:bottom-24 lg:right-8 lg:w-[210px]">
          <Speedometer ref={gauge} label={CHAPTERS[active].readout} className="w-full" />
          <p className="-mt-2 text-center font-mono text-[11px] text-white/60">Chapter {CHAPTERS[active].n} of {String(N).padStart(2, "0")}</p>
        </div>
      </div>
    </section>
  );
}
