"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, useGSAP);
  gsap.config({ nullTargetWarn: false });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isSmallScreen = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

export { gsap, ScrollTrigger, DrawSVGPlugin, SplitText, useGSAP };
