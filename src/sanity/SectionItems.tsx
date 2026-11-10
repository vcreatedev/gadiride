"use client";
import { forwardRef, useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { Preview, getPublishedId, useClient, useSchema, type ObjectSchemaType, type SanityDocument, type SchemaType } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { Badge, Box, Button, Card, Dialog, Flex, Stack, Text, Tooltip, useToast } from "@sanity/ui";
import { AddIcon, DragHandleIcon, EyeClosedIcon, EyeOpenIcon, PublishIcon, ResetIcon, TrashIcon } from "@sanity/icons";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { LIVE_DATASET, apiVersion, testOverlay } from "./env";
import { liveCopies, mergedFetch } from "./testCopy";
import { urlFor } from "./image";
import type { ItemList } from "./pageMap";
import { LIVE_DELAY, describeChanges, sameValue } from "./publishChanges";
import { scheduleState, whenText, type Schedule } from "@/lib/timer";
import { tripEndsAt } from "@/lib/trips";
import { useNow } from "./TimerInput";

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
/** `dirty`: has a draft that really differs from the website (an untouched leftover draft does not count). */
/** `liveOnly` (test copy only): a live item not edited here; `doc` is its content, for the preview. */
type Entry = { id: string; previewId: string; ids: string[]; shown: boolean; dirty: boolean; schedule: Schedule; liveOnly: boolean; doc?: Record<string, unknown> };
type Row = { _id: string; shown: boolean; doc: Record<string, unknown>; live?: boolean };

/** A document without its system fields, for comparing a draft with its live copy. */
const content = (d: Record<string, unknown> | undefined) => {
  if (!d) return undefined;
  const { _id: _i, _rev: _r, _updatedAt: _u, _createdAt: _c, ...rest } = d;
  return rest;
};

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
    // Test copy: the test edits plus the live items not edited here (same filter and order).
    const rowsQuery = `*[${where}] | order(${sort}){_id, "shown": ${shownExpr}, "doc": @, "live": _live == true}`;
    const load = () =>
      (testOverlay ? mergedFetch<Row[]>(client, rowsQuery, vars) : client.fetch<Row[]>(rowsQuery, vars)).then(
        (rows) => {
          if (!alive) return;
          // One entry per item; its draft (unpublished edits) decides what the admin shows, order included.
          const docs = new Map(rows.map((r) => [r._id, r.doc]));
          const byId = new Map<string, Entry & { rank: number }>();
          rows.forEach((r, rank) => {
            const id = getPublishedId(r._id);
            const isDraft = r._id !== id;
            const e = byId.get(id);
            if (!e) byId.set(id, { id, previewId: r._id, ids: [r._id], shown: r.shown, dirty: false, schedule: {}, rank, liveOnly: !!r.live, doc: r.doc });
            else byId.set(id, { ...e, ids: [...e.ids, r._id], ...(isDraft ? { shown: r.shown, rank, previewId: r._id } : {}) });
          });
          const withDirty = [...byId.values()].map((e) => {
            const draft = docs.get(`drafts.${e.id}`);
            const live = docs.get(e.id);
            const shownDoc = (draft ?? live) as (Schedule & { expiresAt?: string; date?: string; time?: string }) | undefined;
            // Trips end at "Show until" (expiresAt), else when they start (their date and start time).
            const tripEnd = type === "trip" && shownDoc?.date ? tripEndsAt(shownDoc.date, shownDoc.time, shownDoc.expiresAt) : undefined;
            const schedule = { liveFrom: shownDoc?.liveFrom, liveUntil: shownDoc?.liveUntil ?? tripEnd };
            return { ...e, dirty: !!draft && (!live || !sameValue(content(draft), content(live))), schedule };
          });
          setEntries(withDirty.sort((a, b) => a.rank - b.rank).map(({ rank: _rank, ...e }) => e));
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

const isLive = (e: Entry) => e.ids.some((id) => !id.startsWith("drafts."));
const hasDraft = (e: Entry) => e.ids.some((id) => id.startsWith("drafts."));

/** A vehicle's timer, when it has one: "Goes live in 2 days", "Hides in 5 days" or "Ended". */
function TimerTag({ schedule }: { schedule: Schedule }) {
  const now = useNow();
  const state = scheduleState(schedule, now);
  if (!state) return null;
  const tone = state.kind === "waiting" ? "caution" : state.kind === "ended" ? "critical" : "primary";
  const help = [schedule.liveFrom && `Go live at: ${whenText(schedule.liveFrom)}`, schedule.liveUntil && `Show until: ${whenText(schedule.liveUntil)}`].filter(Boolean).join(" · ");
  return (
    <Tooltip content={tip(help)} placement="top" portal>
      <Badge tone={tone} fontSize={0} padding={2} radius={2} style={{ whiteSpace: "nowrap" }}>⏱ {state.text}</Badge>
    </Tooltip>
  );
}

/** Test copy: a live item not edited here, shown from its live content (the test copy does not have it). */
function LivePreview({ doc }: { doc?: Record<string, unknown> }) {
  const photo = findPhoto(doc);
  return (
    <Flex align="center" gap={2} padding={2}>
      <Box style={{ width: 33, height: 33, flexShrink: 0, borderRadius: 3, overflow: "hidden", background: "var(--card-muted-bg-color, #f3f3f3)" }}>
        {photo && <img src={urlFor({ asset: { _ref: photo } }, LIVE_DATASET).width(66).height(66).fit("crop").url()} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </Box>
      <Stack space={2} style={{ minWidth: 0 }}>
        <Text size={1} weight="medium" textOverflow="ellipsis">{docLabel(doc)}</Text>
        <Text size={0} muted textOverflow="ellipsis">Live content · not changed in this test copy</Text>
      </Stack>
    </Flex>
  );
}

/** The first photo in a document (gallery, then other image fields), for a small preview. */
function findPhoto(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.map(findPhoto).find(Boolean);
  if (!value || typeof value !== "object") return undefined;
  const ref = (value as { asset?: { _ref?: unknown } }).asset?._ref;
  if (typeof ref === "string" && ref.startsWith("image-")) return ref;
  return Object.values(value as Record<string, unknown>).map(findPhoto).find(Boolean);
}

/** Whether this item is on the website: Live, Hidden, or has edits still waiting for Publish. */
function LiveTag({ entry }: { entry: Entry }) {
  if (entry.liveOnly) {
    return (
      <Tooltip content={tip("From the live site, not changed in this test copy. Edit it (or use the eye) to make a test copy of just this item.")} placement="top" portal>
        <Badge tone="positive" fontSize={0} padding={2} radius={2} style={{ whiteSpace: "nowrap" }}>Live</Badge>
      </Tooltip>
    );
  }
  const [tone, label, help] = !isLive(entry)
    ? (["caution", "Not published", "Not on the website yet. Open it and click Publish."] as const)
    : entry.dirty
      ? (["caution", "Edits not published", "The website shows the older version until you click Publish changes above (or open it and click Publish)."] as const)
      : !entry.shown
        ? (["default", "Hidden", "Published, but hidden on the website. Click the eye to show it."] as const)
        : (["positive", "Live", "Showing on the website."] as const);
  return (
    <Tooltip content={tip(help)} placement="top" portal>
      <Badge tone={tone} fontSize={0} padding={2} radius={2} style={{ whiteSpace: "nowrap" }}>{label}</Badge>
    </Tooltip>
  );
}

type RowProps = {
  entry: Entry;
  type: string;
  schemaType: SchemaType;
  sortable: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onPublish: () => void;
  onDiscard: () => void;
};

function ItemRow({ entry, type, schemaType, sortable, onToggle, onDelete, onPublish, onDiscard }: RowProps) {
  const draft = entry.dirty;
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
          {entry.liveOnly ? <LivePreview doc={entry.doc} /> : <Preview schemaType={schemaType} value={{ _id: entry.previewId, _type: type }} layout="default" />}
        </Card>
        {testOverlay && !entry.liveOnly && (
          <Tooltip content={tip("Stored in this test copy: shown on the test site only, and removed about an hour after the last change.")} placement="top" portal>
            <Badge tone="caution" fontSize={0} padding={2} radius={2} style={{ whiteSpace: "nowrap" }}>Test edit</Badge>
          </Tooltip>
        )}
        <LiveTag entry={entry} />
        <TimerTag schedule={entry.schedule} />
        {/* Always shown; greyed out while this item matches the website. */}
        <Tooltip content={tip(draft ? "Publish this item: see its changes, then put them on the website" : "Nothing to publish: matches the website")} placement="top" portal>
          <span><Button mode={draft ? "default" : "ghost"} tone="positive" fontSize={1} paddingX={2} paddingY={2} text="Publish" disabled={!draft} onClick={onPublish} /></span>
        </Tooltip>
        <Tooltip content={tip(!draft ? "Nothing to discard: matches the website" : isLive(entry) ? "Discard changes: go back to what the website shows" : "Discard: this was never published, so it is removed")} placement="top" portal>
          <span><Button mode="ghost" tone="caution" fontSize={1} paddingX={2} paddingY={2} text="Discard" disabled={!draft} onClick={onDiscard} /></span>
        </Tooltip>
        {onToggle && (
          <Tooltip content={tip(entry.shown ? "Click to hide on the website (then Publish)" : "Hidden on the website. Click to show (then Publish)")} placement="top" portal>
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

const draftId = (id: string) => `drafts.${id}`;
const LABEL_KEYS = ["name", "title", "question", "heading", "label", "city"];
const docLabel = (d: Record<string, unknown> | undefined) => {
  const v = LABEL_KEYS.map((k) => d?.[k]).find((x) => typeof x === "string" && x.trim());
  return typeof v === "string" ? v : "Untitled";
};
const stripMeta = ({ _rev: _r, _updatedAt: _u, _createdAt: _c, ...doc }: SanityDocument) => doc;

type Pending = { id: string; label: string; lines: string[]; draft: SanityDocument };
/** `all`: started from the list's "Publish ALL" / "Discard ALL" (every changed item), not one row. */
type Review = { mode: "publish" | "discard"; all: boolean; ready: Pending[]; fresh: { id: string; label: string }[] };

/** "Publish ALL 3 changed items?" for the whole list; "Publish "Maruti Swift"?" for one row. */
function dialogTitle(review: Review, count: number) {
  const one = review.ready[0]?.label ?? review.fresh[0]?.label ?? "this item";
  if (review.mode === "publish") return review.all ? `Publish ALL ${count} changed item${count === 1 ? "" : "s"}?` : `Publish "${one}"?`;
  return review.all ? `Discard ALL changes to ${count} item${count === 1 ? "" : "s"}?` : `Discard changes to "${one}"?`;
}

/** Before Publish or Discard: every item and exactly which of its changes go live, or are thrown away. */
function ChangesDialog({ review, busy, listKey, onCancel, onConfirm }: { review: Review; busy: boolean; listKey: string; onCancel: () => void; onConfirm: () => void }) {
  const publishing = review.mode === "publish";
  const count = review.ready.length + (publishing ? 0 : review.fresh.length);
  const heading = publishing
    ? review.ready.length ? `These changes go live on the website (${LIVE_DELAY}):` : "Nothing here can be published from the list."
    : "These unpublished changes will be thrown away. The website keeps what it shows now:";
  return (
    <Dialog
      id={`${review.mode}-${listKey}`}
      header={dialogTitle(review, count)}
      width={1}
      onClose={() => !busy && onCancel()}
      footer={
        <Flex gap={2} padding={3} justify="flex-end">
          <Button mode="ghost" text={publishing ? "Not yet" : "Keep changes"} disabled={busy} onClick={onCancel} />
          <Button
            tone={publishing ? "positive" : "critical"}
            icon={publishing ? PublishIcon : ResetIcon}
            text={publishing ? (review.all ? "Publish ALL now" : "Publish now") : review.all ? "Discard ALL changes" : "Discard changes"}
            loading={busy}
            disabled={!count}
            onClick={onConfirm}
          />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text size={1} weight="semibold">{heading}</Text>
          {review.ready.map((p) => (
            <Stack key={p.id} space={2}>
              <Text size={1} weight="semibold">{p.label}</Text>
              {p.lines.map((l, i) => <Text key={i} size={1} muted>• {l}</Text>)}
            </Stack>
          ))}
          {review.fresh.length > 0 && (publishing ? (
            <Text size={1} muted>New, never published: {review.fresh.map((f) => f.label).join(", ")}. Open each one and click Publish, so its required fields are checked.</Text>
          ) : (
            <Stack space={2}>
              <Text size={1} weight="semibold">Never published, so these are removed completely:</Text>
              {review.fresh.map((f) => <Text key={f.id} size={1} muted>• {f.label}</Text>)}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Dialog>
  );
}

/**
 * The eye and drag-to-order save to the item's draft only. Nothing reaches the website until
 * "Publish changes" (which first lists what goes live) or the item's own Publish button.
 */
export function ItemListBlock({ list }: { list: ItemList }) {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const schemaType = useSchema().get(list.type);
  const sort = list.sort ?? SITE_SORT[list.type] ?? DEFAULT_SORT;
  const sortable = !list.sort; // custom orders (e.g. "Featured" first) are not drag-sortable
  const loaded = useEntries(list, sort);
  const [pending, setPending] = useState<Entry[] | null>(null);
  // The Publish / Discard dialog: the items with real changes, and new items never published.
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => setPending(null), [loaded]);
  const entries = pending ?? loaded;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = useMemo(() => (entries ?? []).map((e) => e.id), [entries]);
  if (!schemaType) return null;
  const template = list.template === false ? null : list.template ?? { id: list.type, params: {} };
  const changed = (entries ?? []).filter((e) => e.dirty);

  // Writes to each item's draft (made from the live copy when there is none yet); the live copy is untouched.
  const commit = async (patches: { entry: Entry; set: Record<string, unknown> }[], next: Entry[], title: string) => {
    setPending(next);
    try {
      const needDraft = patches.filter((p) => !hasDraft(p.entry)).map((p) => p.entry.id);
      const stored = needDraft.length ? await client.fetch<SanityDocument[]>("*[_id in $ids]", { ids: needDraft }) : [];
      // Test copy: a live item not stored here yet is copied (just that item) before the change.
      const fromLive = testOverlay ? await liveCopies(client, needDraft.filter((id) => !stored.some((d) => d._id === id))) : [];
      const live = [...stored, ...fromLive];
      const tx = client.transaction();
      for (const doc of live) tx.createIfNotExists({ ...stripMeta(doc), _id: draftId(doc._id) });
      for (const p of patches) tx.patch(draftId(p.entry.id), (q) => q.set(p.set));
      await tx.commit();
      toast.push({ status: "info", title, description: "Saved as a draft. Not on the website until you click Publish changes." });
    } catch (err) {
      setPending(null);
      toast.push({ status: "error", title: "Could not save", description: (err as Error).message });
    }
  };
  const onToggle = (e: Entry) => {
    const v = visibilityOf(list.type);
    void commit([{ entry: e, set: { [v.field]: e.shown ? v.hide : v.show } }], (entries ?? []).map((x) => (x.id === e.id ? { ...x, shown: !x.shown, dirty: true } : x)), e.shown ? "Set to hide" : "Set to show");
  };
  // Deletes the item for good (published copy and any draft), after a confirm.
  const onDelete = (e: Entry) => {
    const question = testOverlay
      ? "Remove this test edit? A live item shows its live version again on the test site; one added here is removed."
      : "Delete this for good? It disappears from the website and cannot be undone. (To only hide it, use the eye.)";
    if (!window.confirm(question)) return;
    setPending((entries ?? []).filter((x) => x.id !== e.id));
    const tx = client.transaction();
    for (const id of e.ids) tx.delete(id);
    tx.commit()
      .then(() => toast.push({ status: "success", title: "Deleted", description: `Removed from the website ${LIVE_DELAY}.` }))
      .catch((err: Error) => {
        setPending(null);
        toast.push({ status: "error", title: "Could not delete", description: err.message.includes("reference") ? "Something else still links to it. Remove that link first." : err.message });
      });
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!entries || !over || active.id === over.id) return;
    const next = arrayMove(entries, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    void commit(next.map((e, i) => ({ entry: e, set: { order: (i + 1) * 10 } })), next, "New order saved");
  };

  // Lists each item's changes before anything is published or discarded (one row, or the whole list).
  const onReview = async (targets: Entry[], mode: "publish" | "discard", all = false) => {
    try {
      const docs = await client.fetch<SanityDocument[]>("*[_id in $ids]", { ids: targets.flatMap((e) => [e.id, draftId(e.id)]) });
      const byId = new Map(docs.map((d) => [d._id, d]));
      const ready: Pending[] = [];
      const fresh: { id: string; label: string }[] = [];
      for (const e of targets) {
        const draft = byId.get(draftId(e.id));
        const live = byId.get(e.id);
        if (!draft) continue;
        if (!live) fresh.push({ id: e.id, label: docLabel(draft) });
        else ready.push({ id: e.id, label: docLabel(draft), draft, lines: describeChanges(schemaType as ObjectSchemaType, draft, live) });
      }
      setReview({ mode, all, ready, fresh });
    } catch (err) {
      toast.push({ status: "error", title: "Could not load the changes", description: (err as Error).message });
    }
  };
  const onDiscard = (e: Entry) => void onReview([e], "discard");
  const onDiscardAll = () => void onReview(changed, "discard", true);

  // Throws away the listed drafts: changed items go back to the live version, never-published ones are removed.
  const discardAll = async () => {
    if (!review) return;
    setBusy(true);
    try {
      const tx = client.transaction();
      for (const id of [...review.ready.map((p) => p.id), ...review.fresh.map((f) => f.id)]) tx.delete(draftId(id));
      await tx.commit();
      toast.push({ status: "success", title: "Changes discarded", description: "Back to what the website shows." });
      setReview(null);
    } catch (err) {
      toast.push({ status: "error", title: "Could not discard", description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  // Same as each item's Publish: the draft becomes the live copy.
  const publishAll = async () => {
    if (!review) return;
    setBusy(true);
    try {
      const tx = client.transaction();
      for (const p of review.ready) {
        tx.createOrReplace({ ...stripMeta(p.draft), _id: p.id });
        tx.delete(draftId(p.id));
      }
      await tx.commit();
      toast.push({ status: "success", title: "Published", description: `Live on the website ${LIVE_DELAY}.` });
      setReview(null);
    } catch (err) {
      toast.push({ status: "error", title: "Could not publish", description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack space={2}>
      <Flex align="center" gap={2} wrap="wrap">
        <Box flex={1} style={{ minWidth: 200 }}>
          <Text size={1} weight="semibold">{list.title}</Text>
          <Box marginTop={2}><Text size={0} muted>{changed.length ? `${changed.length} item${changed.length > 1 ? "s" : ""} with changes not on the website yet: publish each row, or all of them with Publish ALL changes.` : "Everything here matches the website. Changes stay drafts until you publish them (each row, or Publish ALL changes)."}</Text></Box>
        </Box>
        {/* All changed items in this list at once; greyed out with nothing to do. */}
        {/* List-wide: every changed item in this list at once (each row also has its own Publish / Discard). */}
        <Tooltip content={tip(changed.length ? `Throws away the unpublished changes of all ${changed.length} changed item${changed.length === 1 ? "" : "s"} in this list` : "Nothing to discard in this list")} placement="top" portal>
          <span><Button icon={ResetIcon} text={`Discard ALL changes (${changed.length})`} tone="caution" mode="ghost" fontSize={1} padding={2} disabled={!changed.length} onClick={onDiscardAll} /></span>
        </Tooltip>
        <Tooltip content={tip(changed.length ? `Publishes all ${changed.length} changed item${changed.length === 1 ? "" : "s"} in this list at once (one website refresh)` : "Nothing to publish in this list")} placement="top" portal>
          <span><Button icon={PublishIcon} text={`Publish ALL changes (${changed.length})`} tone="positive" fontSize={1} padding={2} disabled={!changed.length} onClick={() => onReview(changed, "publish", true)} /></span>
        </Tooltip>
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
                {entries.map((e) => <ItemRow key={e.id} entry={e} type={list.type} schemaType={schemaType} sortable={sortable} onToggle={list.toggle === false ? undefined : () => onToggle(e)} onDelete={list.template === false || e.liveOnly ? undefined : () => onDelete(e)} onPublish={() => onReview([e], "publish")} onDiscard={() => onDiscard(e)} />)}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Card>
      {review && <ChangesDialog review={review} busy={busy} listKey={`${list.type}-${list.title}`} onCancel={() => setReview(null)} onConfirm={review.mode === "publish" ? publishAll : discardAll} />}
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
