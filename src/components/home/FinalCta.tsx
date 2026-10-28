"use client";
import { useRef } from "react";
import WhatsAppIcon from "../WhatsAppIcon";
import VehicleRig, { type RigHandle } from "../VehicleRig";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { drive } from "@/lib/drive";
import { scrollToTarget } from "@/lib/lenis";
import { whatsappChatHref } from "@/lib/whatsapp";

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const rig = useRef<RigHandle>(null);
  useGSAP(() => {
    const r = rig.current;
    if (!r || prefersReducedMotion()) return;
    gsap.set(r.root, { x: -window.innerWidth });
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } })
      .add(drive(r, { from: -window.innerWidth, to: 0, duration: 2, kind: "enter" }));
  }, { scope: root });

  return (
    <section ref={root} className="relative overflow-hidden bg-ink-900 pt-20 text-white md:pt-28" aria-labelledby="cta-title">
      <div className="container-x relative z-10 text-center">
        <h2 id="cta-title" className="display mx-auto max-w-[16ch] text-5xl text-white md:text-7xl lg:text-8xl">
          Where are you headed<span className="text-brand-500">?</span>
        </h2>
        <p className="lead mx-auto mt-5 text-ink-300">Tell us the vehicle, the place and the date. We will reply with a quote.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-outline-dark" onClick={() => scrollToTarget("#book", -100)}>Find your vehicle</button>
          <a href={whatsappChatHref()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp"><WhatsAppIcon className="h-5 w-5" />Chat on WhatsApp</a>
        </div>
      </div>
      <div className="relative mt-14 h-[clamp(140px,22vw,300px)]">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-[#1b1c20] to-[#0e0f11]"><div className="road-dash absolute left-0 top-1/2 h-[3px] w-full opacity-40" /></div>
        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2">
          <VehicleRig ref={rig} art="sedan" color="#F2611D" width="clamp(260px,40vw,560px)" speedLines shadow="dark" />
        </div>
      </div>
    </section>
  );
}
