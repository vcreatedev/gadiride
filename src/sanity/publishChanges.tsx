"use client";
import { useState } from "react";
import { useDocumentOperation, useSchema, type DocumentActionComponent, type DocumentActionProps, type DocumentBadgeComponent, type ObjectSchemaType } from "sanity";
import { Box, Stack, Text } from "@sanity/ui";
import { HIDDEN_FIELD } from "./schemaTypes/visibility";

type Doc = Record<string, unknown>;
type Item = Doc & { _key?: string };

/** Published changes reach the website within this long (content is cached for 60s, or a webhook clears it). */
export const LIVE_DELAY = "within a minute";

/** Compares two values, whatever order their keys came in (ignores revision stamps). */
export function sameValue(a: unknown, b: unknown): boolean {
  return stable(a) === stable(b);
}
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v).filter((k) => k !== "_updatedAt" && k !== "_rev").sort().map((k) => `${k}:${stable((v as Doc)[k])}`).join(",")}}`;
  }
  return JSON.stringify(v ?? null);
}

/** A document without its system fields (ids, revision, timestamps), for comparing draft and live copies. */
const content = ({ _id: _i, _rev: _r, _updatedAt: _u, _createdAt: _c, ...rest }: Doc) => rest;

const LABEL_KEYS = ["title", "heading", "name", "label", "question", "text", "eyebrow", "city"];
const short = (s: string, n = 40) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** A readable name for a list item: its title, name, label… or its position. */
function itemLabel(item: Item, index: number): string {
  for (const k of LABEL_KEYS) {
    const v = item[k];
    if (typeof v === "string" && v.trim()) return `“${short(v.trim())}”`;
  }
  return `item ${index + 1}`;
}

function showValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "on" : "off";
  if (v === undefined || v === null || v === "") return "empty";
  if (typeof v === "string" || typeof v === "number") return `“${short(String(v))}”`;
  return "changed";
}

const isImage = (v: unknown) => !!v && typeof v === "object" && "asset" in (v as Doc);
const isKeyedList = (v: unknown): v is Item[] => Array.isArray(v) && v.some((x) => x && typeof x === "object" && "_key" in x);

/** What happened to a list (slides, cards, banners...): added, removed, shown / hidden, edited, re-ordered. */
function listChanges(title: string, now: Item[], before: Item[]): string[] {
  const old = new Map(before.map((x) => [x._key, x]));
  const cur = new Map(now.map((x) => [x._key, x]));
  const out: string[] = [];
  now.forEach((item, i) => {
    const prev = old.get(item._key);
    if (!prev) return void out.push(`${title}: added ${itemLabel(item, i)}`);
    if (sameValue(item, prev)) return;
    const { [HIDDEN_FIELD]: h1, ...rest1 } = item;
    const { [HIDDEN_FIELD]: h0, ...rest0 } = prev;
    if ((h1 === true) !== (h0 === true)) out.push(`${title}: ${itemLabel(item, i)} will be ${h1 === true ? "HIDDEN on" : "SHOWN on"} the website`);
    if (!sameValue(rest1, rest0)) out.push(`${title}: edited ${itemLabel(item, i)}`);
  });
  before.forEach((item, i) => {
    if (!cur.has(item._key)) out.push(`${title}: removed ${itemLabel(item, i)}`);
  });
  const order = (xs: Item[]) => xs.map((x) => x._key).filter((k) => old.has(k) && cur.has(k)).join();
  if (order(now) !== order(before)) out.push(`${title}: new order`);
  return out;
}

/** Every difference between the draft and the published copy, one line each, using the admin's field names. */
export function describeChanges(schemaType: ObjectSchemaType | undefined, draft: Doc, published: Doc | null): string[] {
  if (!published) return ["This is new: it will appear on the website."];
  const fields = schemaType?.fields ?? [];
  const names = new Set([...Object.keys(draft), ...Object.keys(published)].filter((k) => !k.startsWith("_")));
  const out: string[] = [];
  for (const name of names) {
    const a = draft[name];
    const b = published[name];
    if (sameValue(a, b)) continue;
    const field = fields.find((f) => f.name === name);
    const title = field?.type.title ?? name;
    if (name === "asset") out.push(!b ? "Photo added" : !a ? "Photo removed" : "Photo replaced with a different picture");
    else if (name === "crop" || name === "hotspot") out.push("Photo crop or focus point changed");
    else if (name === HIDDEN_FIELD) out.push(a === true ? "Will be HIDDEN on the website" : "Will be SHOWN on the website");
    else if (name === "available") out.push(a === false ? "Will be HIDDEN on the website (not available)" : "Will be SHOWN on the website (available)");
    else if (isKeyedList(a) || isKeyedList(b)) out.push(...listChanges(title, (a as Item[]) ?? [], (b as Item[]) ?? []));
    else if (isImage(a) || isImage(b)) out.push(`${title}: photo ${!b ? "added" : !a ? "removed" : "changed"}`);
    else if (typeof a === "object" || typeof b === "object") out.push(`${title}: changed`);
    else out.push(`${title}: ${showValue(b)} → ${showValue(a)}`);
  }
  return out.length ? out : ["Small changes (nothing visible on the website)."];
}

const MAX_LINES = 25;

function ChangeList({ lines, heading = `These changes will go live on the website (${LIVE_DELAY}):` }: { lines: string[]; heading?: string }) {
  const shown = lines.slice(0, MAX_LINES);
  return (
    <Stack space={3}>
      <Text size={1} weight="semibold">{heading}</Text>
      <Box as="ul" style={{ margin: 0, paddingLeft: 18 }}>
        {shown.map((l, i) => (
          <Box as="li" key={i} paddingY={1}><Text size={1}>{l}</Text></Box>
        ))}
      </Box>
      {lines.length > MAX_LINES && <Text size={1} muted>…and {lines.length - MAX_LINES} more.</Text>}
    </Stack>
  );
}

/** Wraps the Publish button: it first lists what is about to go live, then publishes on "Publish now". */
export function withPublishSummary(original: DocumentActionComponent): DocumentActionComponent {
  const Action: DocumentActionComponent = (props: DocumentActionProps) => {
    const result = original(props);
    const schemaType = useSchema().get(props.type) as ObjectSchemaType | undefined;
    const [open, setOpen] = useState(false);
    if (!result) return result;
    const close = () => setOpen(false);
    const lines = open && props.draft ? describeChanges(schemaType, props.draft as Doc, props.published as Doc | null) : [];
    // Green while there are changes waiting to go live; the usual grey when there is nothing to publish.
    const pending = !!props.draft && (!props.published || !sameValue(content(props.draft as Doc), content(props.published as Doc)));
    return {
      ...result,
      tone: pending && !result.disabled ? "positive" : result.tone,
      onHandle: () => (props.draft ? setOpen(true) : result.onHandle?.()),
      dialog: open
        ? {
            type: "confirm",
            tone: "positive",
            message: <ChangeList lines={lines} />,
            confirmButtonText: "Publish now",
            cancelButtonText: "Not yet",
            onCancel: close,
            onConfirm: () => {
              close();
              result.onHandle?.();
            },
          }
        : result.dialog,
    };
  };
  Action.action = original.action;
  Action.displayName = "PublishWithSummary";
  return Action;
}

/** Wraps "Discard changes": it first lists exactly which unpublished changes will be thrown away. */
export function withDiscardSummary(original: DocumentActionComponent): DocumentActionComponent {
  const Action: DocumentActionComponent = (props: DocumentActionProps) => {
    const result = original(props);
    const schemaType = useSchema().get(props.type) as ObjectSchemaType | undefined;
    const { discardChanges } = useDocumentOperation(props.id, props.type);
    const [open, setOpen] = useState(false);
    if (!result) return result;
    const close = () => setOpen(false);
    const lines = open && props.draft ? describeChanges(schemaType, props.draft as Doc, props.published as Doc | null) : [];
    return {
      ...result,
      onHandle: () => setOpen(true),
      dialog: open
        ? {
            type: "confirm",
            tone: "critical",
            message: <ChangeList lines={lines} heading="These unpublished changes will be thrown away. The website keeps what it shows now:" />,
            confirmButtonText: "Discard changes",
            cancelButtonText: "Keep changes",
            onCancel: close,
            onConfirm: () => {
              discardChanges.execute();
              close();
            },
          }
        : result.dialog,
    };
  };
  Action.action = original.action;
  Action.displayName = "DiscardWithSummary";
  return Action;
}

/** Badge at the top of every document: live, or has changes that are not on the website yet. */
export const LiveStatusBadge: DocumentBadgeComponent = ({ draft, published }) => {
  // A draft that matches the website (e.g. every item published one by one) is not a change.
  const pending = draft && published && !sameValue(content(draft as Doc), content(published as Doc));
  if (draft && published && !pending) return { label: "Live on website", title: "The website shows this version.", color: "success" };
  if (pending) return { label: "Changes not live yet", title: "Click Publish to put these changes on the website", color: "warning" };
  if (draft) return { label: "Not published yet", title: "Not on the website until you click Publish", color: "warning" };
  if (published) return { label: "Live on website", title: `Published: the website shows this (${LIVE_DELAY} after publishing).`, color: "success" };
  return null;
};
