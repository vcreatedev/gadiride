"use client";
/**
 * A vehicle's Name. It also keeps the page address (/vehicle/<slug>/) in step, so the form has no
 * "URL slug" box: a missing or broken address is made from the name; until the vehicle is on the
 * website the address follows the name as it is edited; once it is live the address stays the same,
 * so shared links keep working.
 */
import { useEffect, useState } from "react";
import { getPublishedId, useClient, useDocumentOperation, useEditState, useFormValue, type SanityClient, type StringInputProps } from "sanity";
import { apiVersion, testOverlay } from "./env";
import { liveReader, mergedFetch } from "./testCopy";
import { freeSlug, isMadeFrom, isValidSlug, slugify } from "./vehicleForm";

const SETTLE_MS = 600; // wait until typing stops

type VehicleDoc = Record<string, unknown> & { _id?: string; _type?: string; slug?: { current?: string } };

/** Page addresses used by the other vehicles (test copy: the live ones too). */
async function takenSlugs(client: SanityClient, id: string): Promise<Set<string>> {
  const query = `*[_type == "vehicle" && !(_id in [$id, $draft])].slug.current`;
  const params = { id, draft: `drafts.${id}` };
  const rows = await (testOverlay ? mergedFetch<(string | null)[]>(client, query, params) : client.fetch<(string | null)[]>(query, params));
  return new Set(rows.filter((s): s is string => !!s));
}

/** Whether the vehicle is on the website (published here, or live for the test copy); null while unknown. */
function useOnWebsite(client: SanityClient, id: string, type: string): boolean | null {
  const state = useEditState(id, type, "low");
  const [live, setLive] = useState<boolean | null>(testOverlay ? null : false);
  useEffect(() => {
    if (!testOverlay || !id) return;
    let alive = true;
    liveReader(client)
      .fetch<number>("count(*[_id == $id])", { id })
      .then((n) => alive && setLive(n > 0), () => alive && setLive(false));
    return () => { alive = false; };
  }, [client, id]);
  if (!state.ready || live === null) return null;
  return !!state.published || live;
}

export default function VehicleNameInput(props: StringInputProps) {
  const client = useClient({ apiVersion });
  const doc = useFormValue([]) as VehicleDoc | undefined;
  const id = getPublishedId(doc?._id ?? "");
  const type = doc?._type ?? "vehicle";
  const onWebsite = useOnWebsite(client, id, type);
  const { patch } = useDocumentOperation(id, type);
  const name = props.value ?? "";
  const current = doc?.slug?.current ?? "";
  const { readOnly } = props;
  // The name when the form opened: the address only follows names typed now, so opening never rewrites it.
  const [openedName] = useState(name);
  const renamed = name !== openedName;

  useEffect(() => {
    if (onWebsite === null || readOnly || patch.disabled || !id || !name.trim()) return;
    // A name in another script (e.g. Telugu) has no Latin letters: use a short code from the vehicle's id.
    const base = slugify(name) || `vehicle-${slugify(id).replace(/-/g, "").slice(0, 6)}`;
    // Keep a working address when the vehicle is live, when it already matches the name, or when the name was not changed here.
    if (isValidSlug(current) && (onWebsite || isMadeFrom(current, base) || !renamed)) return;
    let alive = true;
    const timer = setTimeout(() => {
      takenSlugs(client, id).then(
        (taken) => {
          const next = freeSlug(base, taken);
          // Seeded with the form's value, so a document not saved yet starts from what the form shows.
          if (alive && next !== current) patch.execute([{ set: { slug: { _type: "slug", current: next } } }], doc);
        },
        () => undefined, // tried again on the next change to the name
      );
    }, SETTLE_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [client, current, doc, id, name, onWebsite, patch, readOnly, renamed]);

  return props.renderDefault(props);
}
