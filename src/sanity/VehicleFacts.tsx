"use client";
/**
 * A vehicle's price and key facts for the admin's cards (section lists and the Vehicles overview):
 * label | value rows in two aligned columns. Long values wrap instead of being cut off.
 * Facts follow the website: visible specifications, plus the old Mileage box when no row says Mileage.
 */
import { Fragment } from "react";
import { Text } from "@sanity/ui";

export type Fact = { label: string; value: string };

export type FactSource = {
  typeName?: unknown;
  area?: unknown;
  location?: unknown;
  pincode?: unknown;
  specs?: unknown;
  mileage?: unknown;
  options?: unknown;
};

type Spec = { label?: unknown; value?: unknown; hidden?: unknown };

const text = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const isMileage = (label: string) => /mileage/i.test(label);

/** Type, location, specifications (at most `maxSpecs`) and options, in that order. */
export function vehicleFacts(v: FactSource, { maxSpecs = Number.POSITIVE_INFINITY, withOptions = true } = {}): Fact[] {
  const rows = Array.isArray(v.specs) ? (v.specs as Spec[]) : [];
  const specs = rows
    .filter((s) => s && s.hidden !== true && text(s.label) && text(s.value))
    .map((s) => ({ label: text(s.label), value: text(s.value) }));
  const mileage = text(v.mileage);
  const allSpecs = mileage && !specs.some((s) => isMileage(s.label)) ? [...specs, { label: "Mileage", value: mileage }] : specs;
  const place = [text(v.area), text(v.location)].filter(Boolean).join(", ");
  const pincode = text(v.pincode);
  const options = Array.isArray(v.options) ? v.options.map(text).filter(Boolean) : [];
  return [
    ...(text(v.typeName) ? [{ label: "Type", value: text(v.typeName) }] : []),
    ...(place ? [{ label: "Location", value: pincode ? `${place} ${pincode}` : place }] : []),
    ...allSpecs.slice(0, maxSpecs),
    ...(withOptions && options.length ? [{ label: "Options", value: options.join(", ") }] : []),
  ];
}

/** "₹2,200 / day", or "Price on request" when no price is set (as on the website). */
export function PriceText({ pricePerDay }: { pricePerDay?: unknown }) {
  const priced = typeof pricePerDay === "number";
  return (
    <Text size={1} weight="semibold" muted={!priced} style={priced ? { color: "var(--card-accent-fg-color)" } : undefined}>
      {priced ? `₹${pricePerDay.toLocaleString("en-IN")} / day` : "Price on request"}
    </Text>
  );
}

/** Label | value rows; the label column takes at most 45% so long values still have room. */
export function FactsGrid({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "fit-content(45%) minmax(0, 1fr)", columnGap: 12, rowGap: 8, alignItems: "start" }}>
      {facts.map((f, i) => (
        <Fragment key={`${f.label}-${i}`}>
          <Text size={1} muted style={{ overflowWrap: "anywhere" }}>{f.label}</Text>
          <Text size={1} weight="medium" style={{ overflowWrap: "anywhere" }}>{f.value}</Text>
        </Fragment>
      ))}
    </div>
  );
}
