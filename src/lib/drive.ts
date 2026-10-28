"use client";
import { gsap } from "./motion";
import type { RigHandle } from "@/components/VehicleRig";
import { ART } from "@/data/vehicleArt";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Prepare wheel pivots once per rig. Safe to call repeatedly. */
export function prepareRig(rig: RigHandle) {
  rig.wheels.forEach((w) => {
    if ((w as HTMLElement).dataset.ready) return;
    gsap.set(w, { svgOrigin: `${w.getAttribute("data-cx")} ${w.getAttribute("data-cy")}` });
    (w as HTMLElement).dataset.ready = "1";
  });
  Object.values(rig.arms).forEach((g) => {
    gsap.set(g, { svgOrigin: `${g.getAttribute("data-px")} ${g.getAttribute("data-py")}` });
  });
  gsap.set(rig.body, { transformOrigin: "50% 100%" });
}

/**
 * Binds wheel rotation, motion blur, shadow stretch and speed lines to the rig's x position.
 * Rotation is derived from absolute x, so it stays correct when a timeline is scrubbed backwards.
 */
export function bindWheels(rig: RigHandle, opts: { blur?: boolean; source?: Element } = {}) {
  const src = opts.source ?? rig.root;
  prepareRig(rig);
  const rot = rig.wheels.map((w) => gsap.quickSetter(w, "rotation", "deg"));
  const spokeO = rig.spokes.map((s) => gsap.quickSetter(s, "opacity"));
  const blurO = rig.blurs.map((s) => gsap.quickSetter(s, "opacity"));
  const shadowX = gsap.quickSetter(rig.shadow, "scaleX");
  const lineO = rig.lines ? gsap.quickSetter(rig.lines, "opacity") : null;
  let lastX = gsap.getProperty(src, "x") as number;
  let lastT = performance.now();
  let v = 0;
  const update = () => {
    const x = gsap.getProperty(src, "x") as number;
    const r = Math.max(rig.wheelRadiusPx(), 1);
    rot.forEach((s) => s((x / r) * (180 / Math.PI)));
    const now = performance.now();
    const dt = Math.max(now - lastT, 8) / 1000;
    const inst = Math.abs(x - lastX) / dt;
    v = v * 0.7 + inst * 0.3;
    lastX = x;
    lastT = now;
    const k = clamp(v / 1400);
    if (opts.blur !== false) {
      spokeO.forEach((s) => s(1 - k * 0.8));
      blurO.forEach((s) => s(k * 0.95));
    }
    shadowX(1 + k * 0.08);
    lineO?.(clamp((k - 0.35) * 1.6));
  };
  const settle = () => {
    v = 0;
    spokeO.forEach((s) => s(1));
    blurO.forEach((s) => s(0));
    shadowX(1);
    lineO?.(0);
  };
  return { update, settle };
}

type DriveOpts = {
  from: number;
  to: number;
  duration?: number;
  /** "enter": accelerate then brake to a stop. "exit": pull away. "pass": constant-ish cruise. */
  kind?: "enter" | "exit" | "pass";
  blur?: boolean;
};

/** Returns a timeline that drives the rig with suspension response matched to the vehicle's feel. */
export function drive(rig: RigHandle, { from, to, duration, kind = "enter", blur }: DriveOpts) {
  const feel = ART[rig.art].feel;
  const dir = Math.sign(to - from) || 1;
  const dur = duration ?? (kind === "pass" ? 3 : 1.8) / Math.max(feel.accel, 0.4) ** 0.5;
  const ease = kind === "enter" ? "power3.out" : kind === "exit" ? "power2.in" : "none";
  const roll = feel.roll;
  const w = bindWheels(rig, { blur });
  const tl = gsap.timeline({ onComplete: w.settle });

  tl.fromTo(rig.root, { x: from }, { x: to, duration: dur, ease, onUpdate: w.update }, 0);

  if (kind === "enter") {
    // Vehicle arrives already moving, then brakes: nose dips, then rebounds and settles.
    tl.fromTo(rig.body, { rotation: 0, y: 0 }, { rotation: dir * 0.9 * roll, y: 0.6 * roll, duration: dur * 0.55, ease: "sine.in" }, dur * 0.2);
    tl.to(rig.body, { rotation: dir * -0.25 * roll, y: 0, duration: dur * 0.25, ease: "sine.out" }, ">");
    tl.to(rig.body, { rotation: 0, duration: 0.6, ease: "power2.out" }, ">");
  } else if (kind === "exit") {
    // Weight transfers backwards under acceleration: rear squats, nose lifts.
    tl.fromTo(rig.body, { rotation: 0 }, { rotation: dir * -1.1 * roll, y: 0.5 * roll, duration: dur * 0.4, ease: "power2.out" }, 0);
    tl.to(rig.body, { rotation: dir * -0.3 * roll, y: 0, duration: dur * 0.6, ease: "sine.inOut" }, ">");
  } else {
    tl.to(rig.body, { y: -0.8 * roll, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: Math.max(1, Math.floor(dur / 0.35) - 1) }, 0);
  }
  return tl;
}

/** Short JCB work cycle: backhoe digs, loader lifts. */
export function dig(rig: RigHandle) {
  const tl = gsap.timeline();
  const back = rig.arms.backhoe;
  const load = rig.arms.loader;
  if (back) tl.to(back, { rotation: 14, duration: 0.9, ease: "power2.inOut" }).to(back, { rotation: -6, duration: 0.8, ease: "power2.inOut" }).to(back, { rotation: 0, duration: 0.7, ease: "power2.out" });
  if (load) tl.to(load, { rotation: -9, duration: 0.8, ease: "power2.inOut" }, 0.3).to(load, { rotation: 0, duration: 0.8, ease: "power2.inOut" }, ">0.4");
  tl.to(rig.body, { y: 0.8, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0.2);
  return tl;
}
