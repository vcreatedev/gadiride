import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import VehiclesBrowser from "@/components/VehiclesBrowser";

export const metadata: Metadata = { title: "All vehicles", description: "Browse cars, passenger vehicles, logistics vehicles and heavy equipment available from Gadiride." };

export default function VehiclesPage() {
  return (
    <>
      <PageHero title={<>All vehicles<span className="text-brand-500">.</span></>} intro="Filter by group and type, then request a quote for the one you need." art="suv" color="#2B2D31" />
      <section className="section-y bg-surface-50"><div className="container-x"><VehiclesBrowser /></div></section>
    </>
  );
}
