"use client";
import { forwardRef, useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { useClient, useDocumentOperation, useEditState } from "sanity";
import { apiVersion, testOverlay } from "./env";
import { liveCopies } from "./testCopy";
import { usePaneRouter, type UserComponent } from "sanity/structure";
import { Box, Button, Card, Flex, Stack, Text, Tooltip } from "@sanity/ui";
import { DragHandleIcon, EyeClosedIcon, EyeOpenIcon, PublishIcon, ResetIcon } from "@sanity/icons";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { SectionSlot } from "@/data/sections";
import type { PageMap, SectionItem } from "./pageMap";
import { SECTION_FIELDS_PARAM, SECTION_REF_PARAM } from "./SectionInput";
import { DEFAULT_SLOTS, arrange, fullOrder, sameContent, toSanity, toggle, useLayout } from "./sectionOrder";

type LinkProps = { childId: string; childParameters?: Record<string, string>; children?: ReactNode; style?: CSSProperties; title?: string };
const SectionLink = forwardRef<HTMLAnchorElement, LinkProps>(function SectionLink(props, ref) {
  const { ChildLink } = usePaneRouter();
  const Link = ChildLink as unknown as ComponentType<LinkProps & { ref?: typeof ref }>;
  return <Link {...props} ref={ref} />;
});

/** Same row look as Sanity's own lists (e.g. Header → More menu): handle, icon box, title. */
function Row({ item, selected, faded }: { item: SectionItem; selected: boolean; faded: boolean }) {
  const Icon = item.icon;
  const link: LinkProps = {
    childId: item.key,
    title: item.hint,
    childParameters: item.target.kind === "doc" && item.target.fields.length
      ? { [SECTION_FIELDS_PARAM]: item.target.fields.map((f) => f.split(".")[0]).join(","), ...(item.ref ? { [SECTION_REF_PARAM]: item.ref } : {}) }
      : undefined,
  };
  return (
    <Card as={SectionLink} {...link} data-as="a" flex={1} padding={1} radius={2} selected={selected} pressed={selected} style={{ textDecoration: "none", minWidth: 0, opacity: faded ? 0.5 : 1 }}>
      <Flex align="center" gap={2}>
        <Card border radius={1} style={{ width: 33, height: 33, flexShrink: 0, display: "grid", placeItems: "center" }}>
          <Text size={1}><Icon /></Text>
        </Card>
        <Box flex={1} padding={1} style={{ minWidth: 0 }}>
          <Text size={1} weight="medium" textOverflow="ellipsis">{item.title}</Text>
        </Box>
      </Flex>
    </Card>
  );
}

const HANDLE = 33;
const NO_SLOTS: readonly { key: string }[] = [];
const Spacer = () => <Box style={{ width: HANDLE, flexShrink: 0 }} />;

/** One section (a heading and its list move together), draggable by its handle. */
function SortableSection({ slot, items, childItemId, isHidden, onToggle }: { slot: string; items: SectionItem[]; childItemId?: string; isHidden: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: slot });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, position: "relative", zIndex: isDragging ? 2 : undefined };
  return (
    <Card ref={setNodeRef} style={style} radius={2} shadow={isDragging ? 2 : undefined}>
      <Stack space={1}>
        {items.map((it, i) => (
          <Flex key={it.key} align="center" gap={1}>
            {i === 0 ? (
              <Tooltip content={<Box padding={2}><Text size={1}>Drag to re-order</Text></Box>} placement="top" portal>
                <Button ref={setActivatorNodeRef} mode="bleed" icon={DragHandleIcon} padding={2} aria-label={`Drag to re-order ${it.title}`} style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }} {...attributes} {...listeners} />
              </Tooltip>
            ) : <Spacer />}
            <Row item={it} selected={childItemId === it.key} faded={isHidden} />
            {i === 0 ? (
              <Tooltip content={<Box padding={2}><Text size={1}>{isHidden ? "Hidden on the website. Click to show" : "Click to hide on the website"}</Text></Box>} placement="top" portal>
                <Button mode="bleed" padding={2} icon={isHidden ? EyeClosedIcon : EyeOpenIcon} aria-label={isHidden ? `Show ${it.title}` : `Hide ${it.title}`} onClick={onToggle} />
              </Tooltip>
            ) : <Spacer />}
          </Flex>
        ))}
      </Stack>
    </Card>
  );
}

/** Fixed rows (page top, SEO...) keep the same left/right gutters so everything lines up. */
const FixedRow = ({ item, selected }: { item: SectionItem; selected: boolean }) => (
  <Flex align="center" gap={1}><Spacer /><Row item={item} selected={selected} faded={false} /><Spacer /></Flex>
);

/** Groups the page's items into fixed rows and sortable sections, keeping page order. */
function blocks(items: SectionItem[], movable: Set<string>) {
  const out: ({ kind: "fixed"; item: SectionItem } | { kind: "section"; slot: string; items: SectionItem[] })[] = [];
  for (const it of items) {
    const last = out[out.length - 1];
    if (it.slot && movable.has(it.slot)) {
      if (last?.kind === "section" && last.slot === it.slot) last.items.push(it);
      else out.push({ kind: "section", slot: it.slot, items: [it] });
    } else out.push({ kind: "fixed", item: it });
  }
  return out;
}

/** Drag sections to reorder, eye to show/hide. Saved as a draft; reverting drops the draft. */
function OrderedList({ page, childItemId, docId, field }: { page: PageMap; childItemId?: string; docId: string; field: string }) {
  const saved = useLayout(docId, field);
  const defaults = DEFAULT_SLOTS[docId] ?? NO_SLOTS;
  // Shown right away after a drop, until the saved order comes back from Sanity.
  const [pending, setPending] = useState<SectionSlot[] | null>(null);
  useEffect(() => setPending(null), [saved]);
  const rows = useMemo(() => pending ?? fullOrder(saved, defaults), [pending, saved, defaults]);
  const { items, hidden, movable } = useMemo(() => arrange(page.sections, rows), [page, rows]);
  const ops = useDocumentOperation(docId, docId);
  const edit = useEditState(docId, docId);
  const client = useClient({ apiVersion });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Patching before the document has loaded is silently ignored, so wait until it is ready.
  const ready = edit.ready && !edit.transactionSyncLock?.enabled;
  const save = (next: SectionSlot[]) => {
    if (!ready) return;
    setPending(next);
    // Test copy: a page not stored here yet is first copied in full from the live site, so the
    // order change never leaves an almost empty page behind.
    if (testOverlay && !edit.draft && !edit.published) {
      void liveCopies(client, [docId])
        .then(([copy]) => (copy ? client.createIfNotExists({ ...copy, _id: `drafts.${docId}` }) : undefined))
        .then(() => ops.patch.execute([{ setIfMissing: { [field]: [] } }, { set: { [field]: toSanity(next) } }]))
        .catch(() => setPending(null));
      return;
    }
    ops.patch.execute([{ setIfMissing: { [field]: [] } }, { set: { [field]: toSanity(next) } }]);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => r.key === active.id);
    const to = rows.findIndex((r) => r.key === over.id);
    if (from >= 0 && to >= 0) save(arrayMove(rows, from, to));
  };

  // Changed something and changed it back? Drop the leftover draft so nothing shows as unpublished.
  const { draft, published } = edit;
  const { discardChanges } = ops;
  const canDiscard = !discardChanges.disabled;
  useEffect(() => {
    if (!draft || !published || !canDiscard) return;
    const t = window.setTimeout(() => {
      if (sameContent(draft, published, { field, defaults })) discardChanges.execute();
    }, 800);
    return () => clearTimeout(t);
  }, [draft, published, canDiscard, discardChanges, field, defaults]);

  const parts = blocks(items, movable);
  return (
    <>
      {draft && (
        <Card tone="caution" padding={2} paddingLeft={3} radius={2} marginBottom={2}>
          <Flex align="center" gap={2}>
            <Box flex={1}><Text size={1}>Unpublished changes</Text></Box>
            <Button icon={ResetIcon} text="Discard" mode="ghost" disabled={!canDiscard} onClick={() => discardChanges.execute()} />
            <Button icon={PublishIcon} text="Publish" tone="positive" disabled={!!ops.publish.disabled} onClick={() => ops.publish.execute()} />
          </Flex>
        </Card>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={onDragEnd}>
        <SortableContext items={parts.flatMap((p) => (p.kind === "section" ? [p.slot] : []))} strategy={verticalListSortingStrategy}>
          <Stack space={1}>
            {parts.map((p) =>
              p.kind === "fixed" ? (
                <FixedRow key={p.item.key} item={p.item} selected={childItemId === p.item.key} />
              ) : (
                <SortableSection key={p.slot} slot={p.slot} items={p.items} childItemId={childItemId} isHidden={hidden.has(p.slot)} onToggle={() => save(toggle(rows, p.slot))} />
              ),
            )}
          </Stack>
        </SortableContext>
      </DndContext>
    </>
  );
}

/** One page of the website as its sections, top to bottom. Click a section to edit just that section. */
const SectionsPane: UserComponent = ({ options, childItemId }) => {
  const page = options?.page as PageMap;
  return (
    <Box padding={2} style={{ overflowY: "auto", height: "100%" }}>
      {page.layoutDoc ? (
        <OrderedList page={page} childItemId={childItemId} docId={page.layoutDoc} field={page.layoutField ?? "layout"} />
      ) : (
        <Stack space={1}>
          {page.sections.map((it) => (
            <Flex key={it.key}><Row item={it} selected={childItemId === it.key} faded={false} /></Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SectionsPane;
