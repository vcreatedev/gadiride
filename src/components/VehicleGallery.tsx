"use client";
import { useState } from "react";
import VehiclePhoto from "./VehiclePhoto";
import Photo from "./Photo";
import type { Vehicle } from "@/data/vehicles";

/** Main photo with thumbnails. Extra photos (interior, boot…) fill the frame. */
export default function VehicleGallery({ v }: { v: Vehicle }) {
  const shots = [v.photo, ...v.gallery];
  const [i, setI] = useState(0);
  const main = i === 0;
  return (
    <div>
      <VehiclePhoto
        key={i}
        photo={shots[i]}
        fit={main ? v.fit : "cover"}
        bg={main ? v.bg : "dark"}
        zoom={main ? v.zoom : 100}
        priority={main}
        hover={false}
        sizes="(min-width: 1024px) 720px, 100vw"
        className="aspect-[16/10] w-full animate-[fade_.3s_ease-out] rounded-card shadow-card"
      />
      {shots.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" aria-label="Photos">
          {shots.map((p, n) => (
            <li key={p.src + n}>
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={`Show photo ${n + 1}`}
                aria-pressed={i === n}
                className={`relative block h-16 w-24 overflow-hidden rounded-xl bg-white ring-2 transition ${i === n ? "ring-brand-500" : "ring-transparent opacity-70 hover:opacity-100"}`}
              >
                <Photo photo={p} fill sizes="96px" className={n === 0 && v.fit === "contain" ? "object-contain p-1" : "object-cover"} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
