"use client";
/**
 * The body of a row in a section's item list (SectionItems): photo, name and key details.
 * Vehicles show their price and aligned facts; drivers and trips their own details; anything else
 * Sanity's usual preview.
 */
import type { ReactNode } from "react";
import { Preview, type SchemaType } from "sanity";
import { Badge, Box, Flex, Stack, Text } from "@sanity/ui";
import { LIVE_DATASET } from "./env";
import { urlFor } from "./image";
import { stockPhotoUrl } from "./stockPhoto";
import { FactsGrid, PriceText, vehicleFacts } from "./VehicleFacts";

type Doc = Record<string, unknown>;

const LABEL_KEYS = ["name", "title", "question", "heading", "label", "city"];

/** A document's name for lists and dialogs: its name, title, question... or "Untitled". */
export const docLabel = (d: Doc | undefined) => {
  const v = LABEL_KEYS.map((k) => d?.[k]).find((x) => typeof x === "string" && x.trim());
  return typeof v === "string" ? v : "Untitled";
};

/** The first photo in a document (gallery, then other image fields), for a small preview. */
export function findPhoto(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.map(findPhoto).find(Boolean);
  if (!value || typeof value !== "object") return undefined;
  const ref = (value as { asset?: { _ref?: unknown } }).asset?._ref;
  if (typeof ref === "string" && ref.startsWith("image-")) return ref;
  return Object.values(value as Doc).map(findPhoto).find(Boolean);
}

const photoUrl = (ref: string, w: number, h: number) => urlFor({ asset: { _ref: ref } }, LIVE_DATASET).width(w).height(h).fit("crop").url();
const str = (v: unknown) => (typeof v === "string" ? v : undefined);

/** A badge displaying "Key: Value" clearly with muted key label and bold value. */
function KeyValBadge({ label, value, tone = "default" }: { label: string; value: ReactNode; tone?: "default" | "primary" | "positive" | "caution" }) {
  return (
    <Badge tone={tone} fontSize={0} paddingX={2} paddingY={1} radius={2} style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
      <span style={{ opacity: 0.65, fontWeight: 500, marginRight: 4 }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </Badge>
  );
}

const THUMB = { width: 96, height: 64 };

/** Photo on the left, details beside it; on a narrow pane the details move under the photo. */
function VehiclePreview({ doc }: { doc: Doc }) {
  const photo = findPhoto(doc);
  const src = photo ? photoUrl(photo, THUMB.width * 2, THUMB.height * 2) : stockPhotoUrl(str(doc.typeKey), str(doc.group));
  return (
    <Flex gap={3} padding={3} wrap="wrap" align="flex-start">
      <Box style={{ ...THUMB, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: "var(--card-muted-bg-color, #f3f3f3)", border: "1px solid var(--card-border-color, #e5e7eb)" }}>
        {src && <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </Box>
      <Stack space={3} style={{ flex: "1 1 200px", minWidth: 0 }}>
        <Stack space={2}>
          <Text size={2} weight="semibold" style={{ overflowWrap: "anywhere" }}>{docLabel(doc)}</Text>
          <PriceText pricePerDay={doc.pricePerDay} />
        </Stack>
        <FactsGrid facts={vehicleFacts(doc)} />
      </Stack>
    </Flex>
  );
}

function DriverPreview({ doc }: { doc: Doc }) {
  const photo = findPhoto(doc);
  const place = [doc.area, doc.location].filter(Boolean).join(", ");
  const exp = typeof doc.experience === "number" ? `${doc.experience} yrs` : null;
  const duty = str(doc.duty) ?? null;
  const drives = Array.isArray(doc.drives) ? (doc.drives as string[]).slice(0, 2).join(", ") : null;
  return (
    <Flex align="flex-start" gap={3} padding={3} style={{ minWidth: 0 }}>
      <Box style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", overflow: "hidden", background: "var(--card-muted-bg-color, #f3f3f3)", border: "1px solid var(--card-border-color, #e5e7eb)" }}>
        {photo && <img src={photoUrl(photo, 96, 96)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </Box>
      <Stack space={2} style={{ minWidth: 0, flex: 1 }}>
        <Text size={2} weight="bold" textOverflow="ellipsis">{docLabel(doc)}</Text>
        <Flex gap={1} wrap="wrap" align="center">
          {place && <KeyValBadge label="Location" value={place} />}
          {exp && <KeyValBadge label="Experience" value={exp} />}
          {duty && <KeyValBadge label="Duty" value={duty} />}
          {drives && <KeyValBadge label="Drives" value={drives} />}
        </Flex>
      </Stack>
    </Flex>
  );
}

function TripPreview({ doc }: { doc: Doc }) {
  const fromTo = `${doc.from || "?"} → ${doc.to || "?"}`;
  const date = doc.date ? String(doc.date) : null;
  const time = doc.time ? String(doc.time) : null;
  const seats = typeof doc.seats === "number" ? String(doc.seats) : null;
  const price = typeof doc.pricePerSeat === "number" ? `₹${doc.pricePerSeat}` : null;
  return (
    <Flex align="flex-start" gap={3} padding={3} style={{ minWidth: 0 }}>
      <Stack space={2} style={{ minWidth: 0, flex: 1 }}>
        <Text size={2} weight="bold" textOverflow="ellipsis">{fromTo}</Text>
        <Flex gap={1} wrap="wrap" align="center">
          {date && <KeyValBadge label="Date" value={date} />}
          {time && <KeyValBadge label="Time" value={time} />}
          {seats && <KeyValBadge label="Seats left" value={seats} />}
          {price && <KeyValBadge label="Price/seat" value={price} tone="primary" />}
        </Flex>
      </Stack>
    </Flex>
  );
}

/** Test copy: a live item not edited here, shown from its live content. */
function LivePreview({ doc }: { doc?: Doc }) {
  const photo = findPhoto(doc);
  const line = typeof doc?.quote === "string" ? doc.quote : typeof doc?.answer === "string" ? doc.answer : "Live content";
  return (
    <Flex align="center" gap={3} padding={3} style={{ minWidth: 0 }}>
      <Box style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 4, overflow: "hidden", background: "var(--card-muted-bg-color, #f3f3f3)" }}>
        {photo && <img src={photoUrl(photo, 88, 88)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </Box>
      <Stack space={1} style={{ minWidth: 0, flex: 1 }}>
        <Text size={1} weight="bold" textOverflow="ellipsis">{docLabel(doc)}</Text>
        <Text size={0} muted textOverflow="ellipsis">{line}</Text>
      </Stack>
    </Flex>
  );
}

type Props = { doc?: Doc; type: string; schemaType: SchemaType; previewId: string; liveOnly: boolean };

export default function ItemPreview({ doc, type, schemaType, previewId, liveOnly }: Props) {
  if (doc && type === "vehicle") return <VehiclePreview doc={doc} />;
  if (doc && type === "driver") return <DriverPreview doc={doc} />;
  if (doc && type === "trip") return <TripPreview doc={doc} />;
  if (liveOnly || !schemaType) return <LivePreview doc={doc} />;
  return <Preview schemaType={schemaType} value={{ _id: previewId, _type: type }} layout="default" />;
}
