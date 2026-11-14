/**
 * Vehicle types added from a vehicle's form ("New vehicle type"). A new type is saved hidden on the
 * website ("Hide on website", which the site already respects) and marked as waiting for a vehicle,
 * so it can be linked and validated like any type but shows nowhere yet. Publishing a vehicle that
 * uses it (its Publish button, a list row's Publish, Publish ALL) switches it on in the same step.
 */
import { getPublishedId, type SanityClient, type SanityDocument } from "sanity";
import { GROUPS, type GroupId } from "@/data/vehicles";
import { testOverlay } from "./env";
import { mergedFetch } from "./testCopy";
import { HIDDEN_FIELD } from "./schemaTypes/visibility";
import { freeSlug, slugify } from "./vehicleForm";

const KEY_MAX = 40; // same limit as the type's own ID field
const WAITING = "waitingForVehicle";

type TypeRow = { _id: string; name?: string; group?: string; key?: string; hidden?: boolean; waiting?: string; live?: boolean };
type Transaction = ReturnType<SanityClient["transaction"]>;

/** Test copy: the live types count too (`live`), so a new one never repeats a live name or ID. */
const readTypes = (client: SanityClient) => {
  const query = `*[_type == "vehicleType"]{_id, name, group, "key": key.current, "hidden": ${HIDDEN_FIELD} == true, "waiting": ${WAITING}, "live": _live == true}`;
  return testOverlay ? mergedFetch<TypeRow[]>(client, query) : client.fetch<TypeRow[]>(query);
};

export type AddedType = { id: string; name: string; existed: boolean };

/**
 * Adds a vehicle type in `group` for the vehicle `vehicleId`, hidden until that vehicle (or another
 * one using it) is published. A type with the same name in that group is reused instead.
 */
export async function createVehicleType(client: SanityClient, name: string, group: GroupId, vehicleId: string): Promise<AddedType> {
  const rows = await readTypes(client);
  // Only a published type can be linked (a draft-only one would block Publish).
  const same = rows.find((r) => r._id === getPublishedId(r._id) && r.group === group && r.name?.trim().toLowerCase() === name.toLowerCase());
  if (same) {
    // Hidden on the website: shown once this vehicle is published (test copy: only types stored here can be changed).
    if (same.hidden && !same.waiting && !same.live) await client.patch(same._id).set({ [WAITING]: vehicleId }).commit();
    return { id: same._id, name: same.name ?? name, existed: true };
  }
  const base = slugify(name, KEY_MAX) || "type";
  const key = freeSlug(base, new Set(rows.map((r) => r.key).filter((k): k is string => !!k)));
  const id = crypto.randomUUID();
  await client.create({
    _id: id,
    _type: "vehicleType",
    name,
    key: { _type: "slug", current: key },
    group,
    art: GROUPS.find((g) => g.id === group)?.art ?? "sedan",
    order: 100,
    [HIDDEN_FIELD]: true,
    [WAITING]: vehicleId,
  });
  return { id, name, existed: false };
}

/** The vehicle's type when it is still waiting (added from a vehicle form, not shown yet), with any draft of it. */
export async function waitingTypes(client: SanityClient, vehicle: object | null | undefined): Promise<SanityDocument[]> {
  const ref = (vehicle as { type?: { _ref?: unknown } } | null | undefined)?.type?._ref;
  if (typeof ref !== "string" || !ref) return [];
  const id = getPublishedId(ref);
  return client.fetch<SanityDocument[]>(`*[_id in [$id, $draft] && _type == "vehicleType" && defined(${WAITING})]`, { id, draft: `drafts.${id}` });
}

/** Adds "show these types on the website" to a transaction (and to their drafts, so a later publish keeps them shown). */
export function revealInto(tx: Transaction, types: SanityDocument[]): Transaction {
  const ids = [...new Set(types.map((t) => t._id))];
  for (const id of ids) tx.patch(id, (p) => p.set({ [HIDDEN_FIELD]: false }).unset([WAITING]));
  return tx;
}

/** The published ones only, once each: one line per type in a "goes live" list. */
export const typeLines = (types: SanityDocument[]): string[] =>
  types
    .filter((t) => t._id === getPublishedId(t._id))
    .map((t) => `New vehicle type "${String(t.name ?? "Untitled")}" goes live with it.`);
