"use client";
import { useRef } from "react";
import { gsap, SplitText, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/motion";

type Props = { children: React.ReactNode; as?: "h1" | "h2"; className?: string; id?: string };

/** Display heading whose lines rise from a mask when scrolled into view. */
export default function SectionTitle({ children, as: Tag = "h2", className = "", id }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const split = SplitText.create(ref.current, { type: "lines", mask: "lines" });
    gsap.from(split.lines, {
      yPercent: 105, duration: 0.85, stagger: 0.08, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
    });
    return () => { split.revert(); ScrollTrigger.refresh(); };
  }, { scope: ref });
  return <Tag ref={ref} id={id} className={`h2 ${className}`}>{children}</Tag>;
}
