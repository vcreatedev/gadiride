"use client";
import { useEffect, useRef, useState } from "react";
import HeroVehicle, { type HeroVehicleHandle } from "./HeroVehicle";
import type { HeroVariant } from "@/data/vehicles";

const EVERY_MS = 30_000;

/**
 * Cycles the page-hero vehicle every 30 seconds: the current one drives off,
 * the next one (different vehicle or colour) drives in. Pauses while the tab is hidden.
 */
export default function HeroCarousel({ variants, driver = false }: { variants: HeroVariant[]; driver?: boolean }) {
  const [i, setI] = useState(0);
  const current = useRef<HeroVehicleHandle>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (variants.length < 2) return;
    const id = window.setInterval(async () => {
      if (busy.current || document.hidden) return;
      busy.current = true;
      await current.current?.exit();
      setI((n) => (n + 1) % variants.length);
      busy.current = false;
    }, EVERY_MS);
    return () => window.clearInterval(id);
  }, [variants.length]);

  const v = variants[i];
  return <HeroVehicle key={`${i}-${v.art}-${v.color}`} ref={current} art={v.art} color={v.color} driver={driver} />;
}
