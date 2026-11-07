"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import VehicleCard from "../VehicleCard";
import SectionTitle from "../SectionTitle";
import CategoryIcon from "../CategoryIcon";
import DriverCard from "../search/DriverCard";
import RequestButton from "../search/RequestButton";
import { accent } from "../Accent";
import { FORMS } from "@/data/forms";
import type { HomeContent } from "@/content/defaults";
import type { Driver } from "@/lib/content";
import type { GroupId, Vehicle } from "@/data/vehicles";

export type FeaturedGroup = { id: GroupId; label: string; vehicles: Vehicle[] };
type TabId = GroupId | "driver";

type Props = {
  content: HomeContent["featured"];
  groups: FeaturedGroup[];
  drivers: Driver[];
  driversLabel: string;
  /** Shown in the Drivers tab while no driver profiles are published. */
  driversEmpty: string;
  showPrices: boolean;
};

const MAX = 15;
const pill = "inline-flex h-11 items-center gap-2 rounded-full pl-3 pr-4 text-sm font-semibold transition";
const pillOn = "bg-brand-gradient text-white shadow-[0_6px_16px_-8px_rgba(232,84,12,0.7)]";
const pillOff = "bg-white text-ink-900 shadow-sm ring-1 ring-line hover:-translate-y-0.5 hover:ring-brand-400";

/** Popular vehicles (and drivers), one service at a time, cars first, with a "View all" button for the open tab. */
export default function Featured({ content: c, groups, drivers, driversLabel, driversEmpty, showPrices }: Props) {
  const [active, setActive] = useState<TabId>(groups[0]?.id ?? "driver");
  const tabs: { id: TabId; label: string; count: number }[] = [
    ...groups.map((g) => ({ id: g.id, label: g.label, count: g.vehicles.length })),
    { id: "driver", label: driversLabel, count: drivers.length },
  ];
  const group = groups.find((g) => g.id === active);
  const allHref = active === "driver" ? "/drivers/" : `/vehicles/${active}/`;

  return (
    <section className="section-y bg-surface-50" aria-labelledby="featured-title">
      <div className="container-x">
        <SectionTitle id="featured-title">{accent(c.title)}</SectionTitle>
        <p className="lead mt-4">{c.text}</p>

        <div role="tablist" aria-label="Popular by service" className="mt-6 flex flex-wrap gap-2.5">
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="featured-panel"
                onClick={() => setActive(t.id)}
                className={`${pill} ${on ? pillOn : pillOff}`}
              >
                <CategoryIcon id={t.id} className={`h-4 w-6 ${on ? "text-white" : "text-brand-500"}`} />
                {t.label}
                {t.count > 0 && <span className={`rounded-full px-1.5 text-xs ${on ? "bg-white/25" : "bg-surface-100 text-ink-600"}`}>{t.count}</span>}
              </button>
            );
          })}
        </div>

        <div id="featured-panel" role="tabpanel" className="mt-10">
          {group && (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.vehicles.map((v, i) => (
                <li key={v.slug} className="flex h-full">
                  <VehicleCard v={v} showPrices={showPrices} />
                </li>
              ))}
            </ul>
          )}
          {active === "driver" && (drivers.length ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {drivers.slice(0, MAX).map((d) => (
                <li key={d.name} className="flex h-full">
                  <DriverCard d={d} title={FORMS.driver.title} entries={[]} requestLabel="Request this driver" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-card bg-white px-6 py-12 text-center shadow-card">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Users className="h-7 w-7" /></span>
              <p className="mt-4 max-w-[52ch] text-ink-600">{driversEmpty}</p>
              <RequestButton title={FORMS.driver.title} entries={[]} label="Request a driver" className="mt-6" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={allHref} className="btn-primary h-12 rounded-full px-7 text-[15px]">
            View all<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
