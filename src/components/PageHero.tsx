import type { ArtId } from "@/data/vehicleArt";
import VehicleSvg from "./VehicleSvg";

/** Short dark header for inner pages. Keeps the header contrast consistent across the site. */
export default function PageHero({ title, intro, art, color = "#C9CDD3", children }: { title: React.ReactNode; intro?: string; art?: ArtId; color?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink-900 pb-16 pt-32 text-white md:pb-20 md:pt-40">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-[#1b1c20] to-[#0e0f11]" />
      {art && (
        <div aria-hidden className="pointer-events-none absolute bottom-6 right-[-6%] w-[70%] opacity-90 md:right-[4%] md:w-[42%]">
          <VehicleSvg art={art} color={color} className="w-full" />
        </div>
      )}
      <div className="container-x relative">
        <h1 className="display max-w-[14ch] text-5xl text-white sm:text-6xl lg:text-7xl">{title}</h1>
        {intro && <p className="lead mt-5 text-ink-300">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
