"use client";
import { useState } from "react";
import { PatchEvent, getPublishedId, set, unset, useClient, useDocumentOperation, useEditState, useFormCallbacks, useFormValue, type ItemProps, type ObjectSchemaType, type Path } from "sanity";
import { isImageType } from "./ImageAddressInput";
import { Badge, Box, Button, Dialog, Flex, Stack, Text, Tooltip, useToast } from "@sanity/ui";
import { EyeClosedIcon, EyeOpenIcon, PublishIcon, ResetIcon } from "@sanity/icons";
import { HIDDEN_FIELD } from "./schemaTypes/visibility";
import { LIVE_DELAY, describeChanges, sameValue } from "./publishChanges";
import { apiVersion } from "./env";

const tip = (text: string) => <Box padding={2}><Text size={1}>{text}</Text></Box>;

/** The value at a form path inside a document ("slides", {_key}, 2...). */
function valueAt(doc: unknown, path: Path): unknown {
  let cur: unknown = doc;
  for (const seg of path) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof seg === "object" && seg !== null && "_key" in seg) {
      cur = Array.isArray(cur) ? cur.find((x) => (x as { _key?: string })?._key === seg._key) : undefined;
    } else {
      cur = (cur as Record<string | number, unknown>)[seg as string | number];
    }
  }
  return cur;
}

/** A form path as a patch path: gallery[_key=="abc"], offers.banners[2]. */
function pathString(path: Path): string {
  return path
    .map((seg, i) => {
      if (typeof seg === "object" && seg !== null && "_key" in seg) return `[_key=="${seg._key}"]`;
      if (typeof seg === "number") return `[${seg}]`;
      return i === 0 ? String(seg) : `.${String(seg)}`;
    })
    .join("");
}

type Unpublished = { kind: "new" | "changed"; live: unknown };

/** This item compared with the website: new, changed, or null when it matches. */
function useUnpublished(props: ItemProps) {
  const id = useFormValue(["_id"]) as string | undefined;
  const type = useFormValue(["_type"]) as string | undefined;
  const publishedId = getPublishedId(id ?? "");
  const state = useEditState(publishedId, type ?? "", "low");
  const pageLive = !!state.published;
  if (!id || !type || !state.draft) return { publishedId, pageLive, change: null };
  const live = state.published ? valueAt(state.published, props.path) : undefined;
  const change: Unpublished | null = live === undefined ? { kind: "new", live } : sameValue(live, props.value) ? null : { kind: "changed", live };
  return { publishedId, pageLive, change };
}

/** Puts only this item on the website (the rest of the page's changes stay drafts). */
function usePublishItem(item: ItemProps, publishedId: string, change: Unpublished | null) {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    if (!change) return;
    setBusy(true);
    try {
      const at = pathString(item.path);
      const list = pathString(item.path.slice(0, -1));
      const patch = change.kind === "changed"
        ? client.patch(publishedId).set({ [at]: item.value })
        : client.patch(publishedId).setIfMissing({ [list]: [] }).insert("after", `${list}[-1]`, [item.value]);
      await patch.commit();
      toast.push({ status: "success", title: "Published", description: `This item is live on the website ${LIVE_DELAY}.` });
    } catch (err) {
      toast.push({ status: "error", title: "Could not publish this item", description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };
  return { publish, busy };
}

/** A list item's name for the dialog: its title, heading, name or label, else "This photo" / "This item". */
function itemName(value: unknown): string {
  const v = (value ?? {}) as Record<string, unknown>;
  const named = ["title", "heading", "name", "label", "question", "alt"].map((k) => v[k]).find((x) => typeof x === "string" && x.trim());
  if (typeof named === "string") return named;
  return "asset" in v ? "This photo" : "This item";
}

/** Before publishing or discarding one item: exactly which of its changes go live, or are thrown away. */
function ItemChangesDialog({ mode, label, lines, isNew, busy, onCancel, onConfirm }: {
  mode: "publish" | "discard"; label: string; lines: string[]; isNew: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const publishing = mode === "publish";
  const heading = publishing
    ? isNew ? `This new item goes live on the website (${LIVE_DELAY}).` : `These changes go live on the website (${LIVE_DELAY}). Other changes on this page stay unpublished:`
    : isNew ? "This new item was never on the website, so it is removed." : "These changes will be thrown away. The website keeps what it shows now:";
  return (
    <Dialog
      id={`item-${mode}-${label}`}
      header={publishing ? `Publish "${label}"?` : `Discard changes to "${label}"?`}
      width={1}
      onClose={() => !busy && onCancel()}
      footer={
        <Flex gap={2} padding={3} justify="flex-end">
          <Button mode="ghost" text={publishing ? "Not yet" : "Keep changes"} disabled={busy} onClick={onCancel} />
          <Button tone={publishing ? "positive" : "critical"} icon={publishing ? PublishIcon : ResetIcon} text={publishing ? "Publish now" : isNew ? "Remove it" : "Discard changes"} loading={busy} onClick={onConfirm} />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack space={3}>
          <Text size={1} weight="semibold">{heading}</Text>
          {lines.map((l, i) => <Text key={i} size={1} muted>• {l}</Text>)}
        </Stack>
      </Box>
    </Dialog>
  );
}

/** Photo lists where the first photo is the main one (a vehicle's Photos). */
const MAIN_FIRST_LISTS = new Set(["gallery"]);

/** In such a list: whether this photo is the main (first) one, and a way to move it first. Null elsewhere. */
function useMainPhoto(item: ItemProps) {
  const listPath = item.path.slice(0, -1);
  const list = useFormValue(listPath) as { _key?: string }[] | undefined;
  const id = useFormValue(["_id"]) as string | undefined;
  const type = useFormValue(["_type"]) as string | undefined;
  const { patch } = useDocumentOperation(getPublishedId(id ?? ""), type ?? "");
  const key = (item.value as { _key?: string } | undefined)?._key;
  if (!key || !Array.isArray(list) || !MAIN_FIRST_LISTS.has(String(listPath[listPath.length - 1])) || !isImageType(item.schemaType)) return null;
  const at = pathString(listPath);
  const makeMain = () => patch.execute([{ unset: [`${at}[_key=="${key}"]`] }, { insert: { before: `${at}[0]`, items: [item.value] } }]);
  return { isMain: list[0]?._key === key, makeMain };
}

/** A list item (photo, slide, card, banner...): its status, Publish / Discard for just this item, and an eye. */
function ItemRow(props: ItemProps & { toggleable: boolean }) {
  const { toggleable, ...item } = props;
  // Inside an item, form callbacks are scoped to that item, so the path is just the field name.
  const { onChange } = useFormCallbacks();
  const { publishedId, pageLive, change } = useUnpublished(item);
  const { publish, busy } = usePublishItem(item, publishedId, change);
  const main = useMainPhoto(item);
  const [confirm, setConfirm] = useState<"publish" | "discard" | null>(null);
  const hidden = (item.value as Record<string, unknown> | undefined)?.[HIDDEN_FIELD] === true;
  if (!toggleable && !change && !main) return item.renderDefault(item);

  const discard = () => {
    if (!change) return;
    onChange(PatchEvent.from(change.kind === "new" ? unset() : set(change.live)));
  };
  const status = change && (change.kind === "new" ? "New: not on the website until you publish it." : "Changed: the website shows the older version until you publish it.");
  return (
    <Flex align="center" gap={1}>
      <Box flex={1} style={{ minWidth: 0, opacity: hidden ? 0.5 : 1 }}>{item.renderDefault(item)}</Box>
      {main?.isMain && (
        <Tooltip content={tip("Shown on cards and at the top of the vehicle page")} placement="top" portal>
          <Badge tone="primary" fontSize={0} padding={2} radius={2} style={{ whiteSpace: "nowrap" }}>Main photo</Badge>
        </Tooltip>
      )}
      {main && !main.isMain && (
        <Tooltip content={tip("Move this photo first, so it becomes the main photo")} placement="top" portal>
          <span><Button mode="ghost" fontSize={1} paddingX={2} paddingY={2} text="Make main" disabled={item.readOnly} onClick={main.makeMain} /></span>
        </Tooltip>
      )}
      {change && (
        <>
          <Tooltip content={tip(status ?? "")} placement="top" portal>
            <Badge tone="caution" fontSize={0} padding={2} radius={2} style={{ whiteSpace: "nowrap" }}>Not published</Badge>
          </Tooltip>
          <Tooltip content={tip(pageLive ? "Publish only this item" : "This page was never published: use the Publish button at the bottom")} placement="top" portal>
            <span><Button tone="positive" fontSize={1} paddingX={2} paddingY={2} text="Publish" loading={busy} disabled={item.readOnly || !pageLive} onClick={() => setConfirm("publish")} /></span>
          </Tooltip>
          <Tooltip content={tip(change.kind === "new" ? "Remove this new item" : "Go back to what the website shows")} placement="top" portal>
            <span><Button mode="ghost" tone="caution" fontSize={1} paddingX={2} paddingY={2} text="Discard" disabled={item.readOnly || busy} onClick={() => setConfirm("discard")} /></span>
          </Tooltip>
        </>
      )}
      {confirm && change && (
        <ItemChangesDialog
          mode={confirm}
          label={itemName(item.value)}
          lines={change.kind === "new" ? [] : describeChanges(item.schemaType as ObjectSchemaType, item.value as Record<string, unknown>, change.live as Record<string, unknown>)}
          isNew={change.kind === "new"}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            if (confirm === "publish") await publish();
            else discard();
            setConfirm(null);
          }}
        />
      )}
      {toggleable && (
        <Tooltip content={tip(hidden ? "Hidden on the website. Click to show, then Publish" : "Click to hide on the website, then Publish")} placement="top" portal>
          <Button
            mode="bleed"
            padding={2}
            icon={hidden ? EyeClosedIcon : EyeOpenIcon}
            aria-label={hidden ? "Show on website" : "Hide on website"}
            disabled={item.readOnly}
            onClick={() => onChange(PatchEvent.from(set(!hidden, [HIDDEN_FIELD])))}
          />
        </Tooltip>
      )}
    </Flex>
  );
}

/** Registered as the form's item component: object items get their publish status and controls, plus an eye when they have the `hidden` flag. */
export default function VisibilityItem(props: ItemProps) {
  const value = props.value as Record<string, unknown> | undefined;
  if (!value || typeof value !== "object" || !("_key" in value)) return props.renderDefault(props);
  const fields = (props.schemaType as ObjectSchemaType).fields;
  const toggleable = Array.isArray(fields) && fields.some((f) => f.name === HIDDEN_FIELD);
  return <ItemRow {...props} toggleable={toggleable} />;
}
