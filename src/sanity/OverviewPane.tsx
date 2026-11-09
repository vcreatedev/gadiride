"use client";
import { forwardRef, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { usePaneRouter, type UserComponent } from "sanity/structure";
import { Badge, Box, Button, Card, Flex, Grid, Heading, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import { PinIcon, SearchIcon } from "@sanity/icons";
import { GROUPS, type GroupId } from "@/data/vehicles";
import { STATUS_LABEL, byLocation, useOverview, type OverviewVehicle, type Status } from "./overviewData";

type LinkProps = { childId: string; childParameters?: Record<string, string>; children?: ReactNode; style?: CSSProperties };

/** Opens a vehicle in the pane to the right of the overview. */
const OpenLink = forwardRef<HTMLAnchorElement, LinkProps>(function OpenLink(props, ref) {
  const { ChildLink } = usePaneRouter();
  const Link = ChildLink as unknown as ComponentType<LinkProps & { ref?: typeof ref }>;
  return <Link {...props} ref={ref} />;
});

type Tone = "positive" | "caution" | "critical" | "default" | "primary";
const STATUS_TONE: Record<Status, Tone> = { live: "positive", scheduled: "caution", ended: "critical", hidden: "default", unpublished: "primary" };
const STATUSES = Object.keys(STATUS_LABEL) as Status[];

type Filters = { group: GroupId | "all"; status: Status | "all" | "edits"; city: string | null; area: string | null; query: string };
const NO_FILTERS: Filters = { group: "all", status: "all", city: null, area: null, query: "" };

function matches(v: OverviewVehicle, f: Filters) {
  const q = f.query.trim().toLowerCase();
  return (
    (f.group === "all" || v.group === f.group) &&
    (f.status === "all" || (f.status === "edits" ? v.edits : v.status === f.status)) &&
    (f.city === null || v.city === f.city) &&
    (f.area === null || (v.area ?? "") === f.area) &&
    (!q || [v.name, v.type, v.city, v.area, v.pincode].some((x) => x?.toLowerCase().includes(q)))
  );
}

/** A count tile at the top; clicking it filters the vehicles below. */
function Tile({ label, value, tone, active, onClick }: { label: string; value: number; tone: Tone; active: boolean; onClick: () => void }) {
  return (
    <Card as="button" type="button" padding={3} radius={3} tone={tone} border shadow={active ? 2 : 0} onClick={onClick} style={{ textAlign: "left", cursor: "pointer", outline: active ? "2px solid var(--card-focus-ring-color)" : undefined }}>
      <Stack space={2}>
        <Text size={4} weight="bold">{value}</Text>
        <Text size={1} muted>{label}</Text>
      </Stack>
    </Card>
  );
}

function VehicleCard({ v }: { v: OverviewVehicle }) {
  return (
    <Card as={OpenLink} childId={v.id} childParameters={{ type: "vehicle" }} radius={3} border shadow={1} overflow="hidden" data-as="a" style={{ textDecoration: "none" }}>
      <div style={{ aspectRatio: "16 / 10", background: "#eef0f3" }}>
        {v.photo && (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, already resized by the image CDN
          <img src={v.photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </div>
      <Stack space={3} padding={3}>
        <Flex gap={1} wrap="wrap">
          <Badge tone={STATUS_TONE[v.status]} fontSize={0}>{STATUS_LABEL[v.status]}</Badge>
          {v.edits && <Badge tone="caution" fontSize={0}>Edits not published</Badge>}
        </Flex>
        <Text size={2} weight="semibold" textOverflow="ellipsis">{v.name}</Text>
        <Text size={1} muted textOverflow="ellipsis">{[v.groupName, v.type].filter(Boolean).join(" · ")}</Text>
        <Flex align="center" gap={2}>
          <Text size={1} muted><PinIcon /></Text>
          <Text size={1} textOverflow="ellipsis">{[v.area, v.city].filter(Boolean).join(", ")}{v.pincode ? ` ${v.pincode}` : ""}</Text>
        </Flex>
        {v.timer && <Text size={1} muted>⏱ {v.timer}</Text>}
      </Stack>
    </Card>
  );
}

/** Cities and their areas with vehicle counts; clicking one filters the vehicles. */
function Locations({ list, filters, setFilters }: { list: OverviewVehicle[]; filters: Filters; setFilters: (f: Filters) => void }) {
  const cities = useMemo(() => byLocation(list), [list]);
  return (
    <Grid columns={[1, 2, 3]} gap={3}>
      {cities.map((c) => {
        const cityOn = filters.city === c.city;
        return (
          <Card key={c.city} padding={3} radius={3} border tone={cityOn ? "primary" : "default"}>
            <Stack space={3}>
              <Flex align="center" gap={2} as="button" type="button" onClick={() => setFilters({ ...filters, city: cityOn ? null : c.city, area: null })} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}>
                <Text size={2}><PinIcon /></Text>
                <Box flex={1}><Text size={2} weight="semibold">{c.city}</Text></Box>
                <Text size={1} muted>{c.total} vehicle{c.total === 1 ? "" : "s"} · {c.live} live</Text>
              </Flex>
              <Flex gap={2} wrap="wrap">
                {c.areas.map((a) => {
                  const on = cityOn && filters.area === a.area;
                  return (
                    <Button
                      key={a.area || "-"}
                      mode={on ? "default" : "ghost"}
                      tone={on ? "primary" : "default"}
                      fontSize={1}
                      padding={2}
                      text={`${a.area || "No area set"} · ${a.count}`}
                      onClick={() => setFilters({ ...filters, city: c.city, area: on ? null : a.area })}
                    />
                  );
                })}
              </Flex>
            </Stack>
          </Card>
        );
      })}
    </Grid>
  );
}

/**
 * Overview: every vehicle at a glance. Counts by website status, cities with their areas, and a photo
 * grid; tiles, services, places and the search box filter the grid. Clicking a vehicle opens it.
 */
const OverviewPane: UserComponent = () => {
  const { vehicles, error } = useOverview();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const all = vehicles ?? [];
  const inGroup = all.filter((v) => filters.group === "all" || v.group === filters.group);
  const shown = all.filter((v) => matches(v, filters));
  const count = (s: Status) => inGroup.filter((v) => v.status === s).length;
  const toggleStatus = (s: Filters["status"]) => setFilters({ ...filters, status: filters.status === s ? "all" : s });
  const filtered = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  if (error) return <Box padding={4}><Card padding={4} tone="critical" radius={3}><Text>{error}</Text></Card></Box>;
  if (!vehicles) return <Flex padding={5} justify="center" gap={3} align="center"><Spinner muted /><Text muted>Loading vehicles…</Text></Flex>;

  return (
    <Box padding={4}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={2}>Vehicle overview</Heading>
          <Text size={1} muted>Every vehicle, where it is and whether the website shows it right now. Click a count, a service, a city or an area to filter; click a vehicle to open it.</Text>
        </Stack>

        <Flex gap={2} wrap="wrap">
          {[{ id: "all" as const, short: "All services" }, ...GROUPS].map((g) => {
            const n = g.id === "all" ? all.length : all.filter((v) => v.group === g.id).length;
            return <Button key={g.id} mode={filters.group === g.id ? "default" : "ghost"} tone={filters.group === g.id ? "primary" : "default"} fontSize={1} padding={3} text={`${g.short} · ${n}`} onClick={() => setFilters({ ...filters, group: g.id })} />;
          })}
        </Flex>

        <Grid columns={[2, 3, 4, 7]} gap={3}>
          <Tile label="All vehicles" value={inGroup.length} tone="default" active={filters.status === "all"} onClick={() => toggleStatus("all")} />
          {STATUSES.map((s) => <Tile key={s} label={STATUS_LABEL[s]} value={count(s)} tone={STATUS_TONE[s]} active={filters.status === s} onClick={() => toggleStatus(s)} />)}
          <Tile label="Edits not published" value={inGroup.filter((v) => v.edits).length} tone="caution" active={filters.status === "edits"} onClick={() => toggleStatus("edits")} />
        </Grid>

        <Stack space={3}>
          <Heading size={1}>Locations</Heading>
          <Locations list={inGroup} filters={filters} setFilters={setFilters} />
        </Stack>

        <Stack space={3}>
          <Flex align="center" gap={3} wrap="wrap">
            <Box flex={1}><Heading size={1}>Vehicles · {shown.length}{filtered ? ` of ${all.length}` : ""}</Heading></Box>
            {filtered && <Button mode="ghost" fontSize={1} padding={2} text="Clear filters" onClick={() => setFilters(NO_FILTERS)} />}
          </Flex>
          <TextInput icon={SearchIcon} placeholder="Search by name, type, city, area or pincode" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.currentTarget.value })} />
          {shown.length ? (
            <Grid columns={[1, 2, 3, 4]} gap={3}>
              {shown.map((v) => <VehicleCard key={v.id} v={v} />)}
            </Grid>
          ) : (
            <Card padding={4} radius={3} border tone="transparent"><Text size={1} muted>No vehicles match these filters.</Text></Card>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default OverviewPane;
