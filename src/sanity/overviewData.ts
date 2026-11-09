"use client";
import { useEffect, useState } from "react";
import { getPublishedId, useClient } from "sanity";
import { DEFAULT_LOCATION } from "@/data/cities";
import { GROUPS, type GroupId } from "@/data/vehicles";
import { scheduleState } from "@/lib/timer";
import { apiVersion } from "./env";
import { stockPhotoUrl } from "./stockPhoto";

/** Where a vehicle stands on the website right now (from its published copy). */
export type Status = "live" | "scheduled" | "ended" | "hidden" | "unpublished";

export const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  scheduled: "Goes live later",
  ended: "Ended",
  hidden: "Hidden",
  unpublished: "Not published",
};

type Row = {
  _id: string; name?: string; group?: GroupId; location?: string; area?: string; pincode?: string;
  available?: boolean; liveFrom?: string; liveUntil?: string; type?: string; typeKey?: string; photo?: string;
};

/** One vehicle for the overview: what the admin sees (draft first) and what the website shows. */
export type OverviewVehicle = {
  id: string; name: string; group?: GroupId; groupName: string; type?: string;
  city: string; area?: string; pincode?: string; photo?: string;
  status: Status; timer?: string; edits: boolean;
};

const QUERY = `*[_type == "vehicle"]{
  _id, name, group, location, area, pincode, available, liveFrom, liveUntil,
  "type": type->name, "typeKey": type->key.current,
  "photo": coalesce(gallery[hidden != true][0].asset->url, image.asset->url, type->image.asset->url)
}`;

/** The website's view: published, switched on, and inside its timers. */
function statusOf(pub: Row | undefined, now: number): Status {
  if (!pub) return "unpublished";
  if (pub.available === false) return "hidden";
  const s = scheduleState(pub, now);
  return s?.kind === "waiting" ? "scheduled" : s?.kind === "ended" ? "ended" : "live";
}

const groupName = (g?: string) => GROUPS.find((x) => x.id === g)?.short ?? "No service";

function toVehicles(rows: Row[], now: number): OverviewVehicle[] {
  const byId = new Map<string, { pub?: Row; draft?: Row }>();
  for (const r of rows) {
    const id = getPublishedId(r._id);
    const e = byId.get(id) ?? {};
    byId.set(id, r._id === id ? { ...e, pub: r } : { ...e, draft: r });
  }
  return [...byId.entries()].map(([id, { pub, draft }]) => {
    const shown = (draft ?? pub) as Row;
    return {
      id,
      name: shown.name?.trim() || "Untitled vehicle",
      group: shown.group,
      groupName: groupName(shown.group),
      type: shown.type,
      city: shown.location?.trim() || DEFAULT_LOCATION,
      area: shown.area?.trim() || undefined,
      pincode: shown.pincode?.trim() || undefined,
      photo: shown.photo ? `${shown.photo}?w=480&h=300&fit=crop&auto=format` : stockPhotoUrl(shown.typeKey, shown.group),
      status: statusOf(pub, now),
      timer: scheduleState(shown, now)?.text,
      edits: !!draft && !!pub,
    };
  });
}

/** Every vehicle, kept up to date while the overview is open (and re-timed every minute). */
export function useOverview() {
  const client = useClient({ apiVersion });
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let alive = true;
    const load = () =>
      client.fetch<Row[]>(QUERY).then(
        (r) => {
          if (!alive) return;
          setRows(r);
          setError(null);
        },
        (e: Error) => alive && setError(e.message || "Could not load the vehicles."),
      );
    void load();
    const sub = client.listen('*[_type == "vehicle"]', {}, { visibility: "query" }).subscribe({ next: () => void load(), error: () => undefined });
    const tick = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      alive = false;
      sub.unsubscribe();
      window.clearInterval(tick);
    };
  }, [client]);
  return { vehicles: rows ? toVehicles(rows, now) : null, error };
}

/** Cities with their areas and counts, biggest first; vehicles without an area count under "" (No area set). */
export function byLocation(list: OverviewVehicle[]) {
  const cities = new Map<string, { total: number; live: number; areas: Map<string, number> }>();
  for (const v of list) {
    const c = cities.get(v.city) ?? { total: 0, live: 0, areas: new Map<string, number>() };
    c.total += 1;
    if (v.status === "live") c.live += 1;
    const a = v.area ?? "";
    c.areas.set(a, (c.areas.get(a) ?? 0) + 1);
    cities.set(v.city, c);
  }
  return [...cities.entries()]
    .map(([city, c]) => ({
      city,
      total: c.total,
      live: c.live,
      areas: [...c.areas.entries()].map(([area, count]) => ({ area, count })).sort((a, b) => b.count - a.count || a.area.localeCompare(b.area)),
    }))
    .sort((a, b) => b.total - a.total || a.city.localeCompare(b.city));
}
