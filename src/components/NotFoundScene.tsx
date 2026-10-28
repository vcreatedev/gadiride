"use client";
import { useRef } from "react";
import VehicleRig, { type RigHandle } from "./VehicleRig";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { drive } from "@/lib/drive";

export default function NotFoundScene() {
  const rig = useRef<RigHandle>(null);
  useGSAP(() => {
    const r = rig.current;
    if (!r || prefersReducedMotion()) return;
    gsap.set(r.root, { x: -window.innerWidth });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.add(drive(r, { from: -window.innerWidth, to: 0, duration: 1.8, kind: "enter" }))
      .add(drive(r, { from: 0, to: window.innerWidth, duration: 1.2, kind: "exit" }), "+=1.4")
      .add(drive(r, { from: -window.innerWidth, to: 0, duration: 1.8, kind: "enter" }), "+=0.6");
  });
  return (
    <div className="relative mx-auto mt-10 h-[min(30vw,220px)] w-full">
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><VehicleRig ref={rig} art="pickup" color="#B7BBC2" width="clamp(220px,34vw,420px)" speedLines shadow="dark" /></div>
    </div>
  );
}
