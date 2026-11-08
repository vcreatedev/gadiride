"use client";
import type { FieldProps } from "sanity";
import { Stack } from "@sanity/ui";
import { popularTab } from "./pageMap";
import { ItemListBlock } from "./SectionItems";

/** A "Popular right now" tab label, with the vehicles (or drivers) that tab shows right under it. */
export default function TabField(props: FieldProps) {
  const list = popularTab(props.name);
  if (!list) return props.renderDefault(props);
  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <ItemListBlock list={list} />
    </Stack>
  );
}
