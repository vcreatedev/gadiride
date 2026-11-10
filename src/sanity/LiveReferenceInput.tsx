"use client";
/**
 * Test copy (dev admin) only: a link to another document (a vehicle's type, a trip's vehicle).
 *
 * The linked document usually exists only on the live site, because the test copy stores just the
 * edited documents. Sanity's own link field cannot show or pick those, so this one does: it shows
 * the linked item's name (from the live site or the test copy) and picks from both. Links are saved
 * as weak links, so a test edit never needs a copy of the document it points to.
 */
import { useEffect, useState } from "react";
import { set, unset, useClient, useFormValue, type ObjectInputProps, type ReferenceSchemaType } from "sanity";
import { Card, Select, Stack, Text } from "@sanity/ui";
import { apiVersion } from "./env";
import { mergedFetch } from "./testCopy";

type Option = { _id: string; label: string };
type FilterResolver = (ctx: { document: unknown; parent: unknown; parentPath: unknown[] }) => { filter?: string; params?: Record<string, unknown> } | Promise<{ filter?: string; params?: Record<string, unknown> }>;

/** The items this link may point to: the field's own filter (e.g. types in the vehicle's group). */
function useOptions(props: ObjectInputProps): Option[] | null {
  const client = useClient({ apiVersion });
  const schemaType = props.schemaType as unknown as ReferenceSchemaType;
  const document = useFormValue([]);
  const types = schemaType.to.map((t) => t.name);
  const resolver = (schemaType.options as { filter?: FilterResolver } | undefined)?.filter;
  const key = JSON.stringify({ types, doc: (document as { group?: string } | undefined)?.group ?? null });
  const [options, setOptions] = useState<Option[] | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const extra = typeof resolver === "function" ? await resolver({ document, parent: props.value, parentPath: props.path.slice(0, -1) }) : {};
      const where = `_type in $types && !(_id in path("drafts.**"))${extra.filter ? ` && (${extra.filter})` : ""}`;
      const rows = await mergedFetch<Option[]>(client, `*[${where}] | order(coalesce(name, title) asc){_id, "label": coalesce(name, title, _id)}`, { ...(extra.params ?? {}), types });
      if (alive) setOptions(rows);
    })().catch(() => alive && setOptions([]));
    return () => { alive = false; };
    // `key` covers the types and the vehicle's group, which is what the filters depend on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, key]);
  return options;
}

export function LiveReferenceInput(props: ObjectInputProps) {
  const options = useOptions(props);
  const current = (props.value as { _ref?: string } | undefined)?._ref;
  const known = options?.some((o) => o._id === current);
  const choose = (id: string) =>
    props.onChange(id ? set({ _type: "reference", _ref: id, _weak: true }) : unset());
  return (
    <Stack space={2}>
      <Select value={current ?? ""} disabled={props.readOnly || options === null} onChange={(e) => choose(e.currentTarget.value)}>
        <option value="">{options === null ? "Loading…" : "Choose…"}</option>
        {current && !known && options !== null && <option value={current}>{current} (not found)</option>}
        {(options ?? []).map((o) => (
          <option key={o._id} value={o._id}>{o.label}</option>
        ))}
      </Select>
      <Card padding={2} radius={2} tone="transparent" border>
        <Text size={0} muted>Test copy: lists the live items and your test edits. Changing it here only affects the test site.</Text>
      </Card>
    </Stack>
  );
}
