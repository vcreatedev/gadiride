"use client";
import { forwardRef, useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { Preview, getPublishedId, useClient, useSchema, type SchemaType } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { Box, Button, Card, Flex, Stack, Text, Tooltip, useToast } from "@sanity/ui";
import { AddIcon, DragHandleIcon, EyeClosedIcon, EyeOpenIcon, TrashIcon } from "@sanity/icons";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { apiVersion } from "./env";
import type { ItemList } from "./pageMap";

type LinkProps = { childId: string; childParameters?: Record<string, string>; childPayload?: unknown; children?: ReactNode; style?: CSSProperties };

/** Opens a document in a pane to the right of the section form (same mechanism as reference fields). */
const OpenLink = forwardRef<HTMLAnchorElement, LinkProps>(function OpenLink(props, ref) {
  const { ChildLink } = usePaneRouter();
  const Link = ChildLink as unknown as ComponentType<LinkProps & { ref?: typeof ref }>;
  return <Link {...props} ref={ref} />;
});

/** How each type is switched off on the website (vehicles and drivers already had "Available"). */
const VISIBILITY: Record<string, { field: string; shown: string; hide: unknown; show: unknown }> = {
  vehicle: { field: "available", shown: "available != false", hide: false, show: true },
  driver: { field: "available", shown: "available != false", hide: false, show: true },
  trip: { field: "available", shown: "available != false", hide: false, show: true },
};
const visibilityOf = (type: string) => VISIBILITY[type] ?? { field: "hidden", shown: "hidden != true", hide: true, show: false };

/** The same order the website uses for each type. */
const SITE_SORT: Record<string, string> = {
  vehicle: "coalesce(order, 100) asc, _createdAt desc",
  vehicleType: "coalesce(order, 100) asc, name asc",
  service: "coalesce(order, 100) asc, name asc",
  driver: "coalesce(order, 100) asc, _createdAt desc",
  testimonial: "coalesce(order, 100) asc, _createdAt desc",
  trip: "date desc, time desc",
};
const DEFAULT_SORT = "coalesce(order, 100) asc, _createdAt asc";

/** One document in the list: its published id plus which copies exist (published, draft). */
type Entry = { id: string; previewId: string; ids: string[]; shown: boolean };

/** Live list in website order; a document with a draft shows once (the draft's state wins). */
function useEntries(list: ItemList, sort: string): Entry[] | null {
  const client = useClient({ apiVersion });
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const { type, filter, params } = list;
  const key = JSON.stringify(params ?? {});
  const shownExpr = visibilityOf(type).shown;
  useEffect(() => {
    let alive = true;
    const vars = { ...JSON.parse(key), type };
    const where = `_type == $type${filter ? ` && (${filter})` : ""}`;
    const load = () =>
      client.fetch<{ _id: string; shown: boolean }[]>(`*[${where}] | order(${sort}){_id, "shown": ${shownExpr}}`, vars).then(
        (rows) => {
          if (!alive) return;
          const byId = new Map<string, Entry>();
          for (const r of rows) {
            const id = getPublishedId(r._id);
            const isDraft = r._id !== id;
            const e = byId.get(id);
            if (!e) byId.set(id, { id, previewId: r._id, ids: [r._id], shown: r.shown });
            else byId.set(id, { ...e, ids: [...e.ids, r._id], ...(isDraft ? { shown: r.shown } : {}) });
          }
          setEntries([...byId.values()]);
        },
        () => alive && setEntries([]),
      );
    load();
    const sub = client.listen(`*[${where}]`, vars, { visibility: "query" }).subscribe({ next: load, error: () => undefined });
    return () => { alive = false; sub.unsubscribe(); };
  }, [client, type, filter, key, sort, shownExpr]);
  return entries;
}

const tip = (text: string) => <Box padding={2}><Text size={1}>{text}</Text></Box>;

function ItemRow({ entry, type, schemaType, sortable, onToggle, onDelete }: { entry: Entry; type: string; schemaType: SchemaType; sortable: boolean; onToggle?: () => void; onDelete?: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id, disabled: !sortable });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, position: "relative", zIndex: isDragging ? 2 : undefined };
  return (
    <Card ref={setNodeRef} style={style} radius={2} shadow={isDragging ? 2 : undefined}>
      <Flex align="center" gap={1}>
        {sortable && (
          <Tooltip content={tip("Drag to re-order")} placement="top" portal>
            <Button ref={setActivatorNodeRef} mode="bleed" icon={DragHandleIcon} padding={2} aria-label="Drag to re-order" style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }} {...attributes} {...listeners} />
          </Tooltip>
        )}
        <Card flex={1} as={OpenLink} childId={entry.id} childParameters={{ type }} radius={2} data-as="a" style={{ textDecoration: "none", minWidth: 0, opacity: entry.shown ? 1 : 0.5 }}>
          <Preview schemaType={schemaType} value={{ _id: entry.previewId, _type: type }} layout="default" />
        </Card>
        {onToggle && (
          <Tooltip content={tip(entry.shown ? "Click to hide on the website" : "Hidden on the website. Click to show")} placement="top" portal>
            <Button mode="bleed" padding={2} icon={entry.shown ? EyeOpenIcon : EyeClosedIcon} aria-label={entry.shown ? "Hide" : "Show"} onClick={onToggle} />
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip content={tip("Delete")} placement="top" portal>
            <Button mode="bleed" tone="critical" padding={2} icon={TrashIcon} aria-label="Delete" onClick={onDelete} />
          </Tooltip>
        )}
      </Flex>
    </Card>
  );
}

/**
 * Order and visibility are saved straight away on the item itself (published and draft copies),
 * the same as switching "Available" on a vehicle.
 */
export function ItemListBlock({ list }: { list: ItemList }) {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const schemaType = useSchema().get(list.type);
  const sort = list.sort ?? SITE_SORT[list.type] ?? DEFAULT_SORT;
  const sortable = !list.sort; // custom orders (e.g. "Featured" first) are not drag-sortable
  const loaded = useEntries(list, sort);
  const [pending, setPending] = useState<Entry[] | null>(null);
  useEffect(() => setPending(null), [loaded]);
  const entries = pending ?? loaded;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = useMemo(() => (entries ?? []).map((e) => e.id), [entries]);
  if (!schemaType) return null;
  const template = list.template === false ? null : list.template ?? { id: list.type, params: {} };

  const commit = (patches: { ids: string[]; set: Record<string, unknown> }[], next: Entry[]) => {
    setPending(next);
    const tx = client.transaction();
    for (const p of patches) for (const id of p.ids) tx.patch(id, (q) => q.set(p.set));
    tx.commit().catch((err: Error) => {
      setPending(null);
      toast.push({ status: "error", title: "Could not save", description: err.message });
    });
  };
  const onToggle = (e: Entry) => {
    const v = visibilityOf(list.type);
    commit([{ ids: e.ids, set: { [v.field]: e.shown ? v.hide : v.show } }], (entries ?? []).map((x) => (x.id === e.id ? { ...x, shown: !x.shown } : x)));
  };
  // Deletes the item for good (published copy and any draft), after a confirm.
  const onDelete = (e: Entry) => {
    if (!window.confirm("Delete this for good? It disappears from the website and cannot be undone. (To only hide it, use the eye.)")) return;
    setPending((entries ?? []).filter((x) => x.id !== e.id));
    const tx = client.transaction();
    for (const id of e.ids) tx.delete(id);
    tx.commit()
      .then(() => toast.push({ status: "success", title: "Deleted" }))
      .catch((err: Error) => {
        setPending(null);
        toast.push({ status: "error", title: "Could not delete", description: err.message.includes("reference") ? "Something else still links to it. Remove that link first." : err.message });
      });
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!entries || !over || active.id === over.id) return;
    const next = arrayMove(entries, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    commit(next.map((e, i) => ({ ids: e.ids, set: { order: (i + 1) * 10 } })), next);
  };

  return (
    <Stack space={2}>
      <Flex align="center" gap={2}>
        <Box flex={1}><Text size={1} weight="semibold">{list.title}</Text></Box>
        {template && (
          <Button as={OpenLink} childId={crypto.randomUUID()} childParameters={{ type: list.type, template: template.id }} childPayload={template.params} icon={AddIcon} text="Add" mode="ghost" fontSize={1} padding={2} />
        )}
      </Flex>
      <Card border radius={2} padding={1}>
        {entries === null ? (
          <Box padding={2}><Text size={1} muted>Loading…</Text></Box>
        ) : entries.length === 0 ? (
          <Box padding={2}><Text size={1} muted>Nothing here yet.</Text></Box>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={onDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <Stack space={1}>
                {entries.map((e) => <ItemRow key={e.id} entry={e} type={list.type} schemaType={schemaType} sortable={sortable} onToggle={list.toggle === false ? undefined : () => onToggle(e)} onDelete={list.template === false ? undefined : () => onDelete(e)} />)}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </Stack>
  );
}

/** The documents that belong to a section (reviews, FAQs, vehicles...), under the section's own fields. */
export default function SectionItems({ lists }: { lists: ItemList[] }) {
  return (
    <Stack space={5}>
      {lists.map((l) => <ItemListBlock key={`${l.type}-${l.title}`} list={l} />)}
    </Stack>
  );
}
