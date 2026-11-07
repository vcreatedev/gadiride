"use client";
import { useEffect } from "react";
import { ALL_FIELDS_GROUP, type InputProps, type ObjectInputProps, type ObjectMember } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { Stack } from "@sanity/ui";
import { findSection } from "./pageMap";
import SectionItems from "./SectionItems";

/**
 * When a document is opened from a page section in the sidebar (e.g. Header → Logo), the pane
 * carries `fields=headerLogo,...` and the form shows only those fields, without tabs.
 * Opened any other way (Site settings, a vehicle...), the form is the normal full form.
 */
export const SECTION_FIELDS_PARAM = "fields";
/** "page/section": the form also lists that section's documents (reviews, FAQs...) under its fields. */
export const SECTION_REF_PARAM = "section";

const keep = (m: ObjectMember, only: Set<string>) => {
  if (m.kind === "field") return only.has(m.name);
  if (m.kind === "fieldSet") return m.fieldSet.members.some((f) => f.kind === "field" && only.has(f.name));
  return false;
};

function RootInput(props: ObjectInputProps) {
  const { params } = usePaneRouter();
  const raw = params?.[SECTION_FIELDS_PARAM];
  const only = raw ? new Set(raw.split(",")) : null;
  const selected = props.groups.find((g) => g.selected)?.name;
  const { onFieldGroupSelect, groups } = props;

  // Section fields can sit in any tab, so look at all fields and filter from there.
  useEffect(() => {
    if (raw && groups.length && selected !== ALL_FIELDS_GROUP.name) onFieldGroupSelect(ALL_FIELDS_GROUP.name);
  }, [raw, groups.length, selected, onFieldGroupSelect]);

  if (!only) return props.renderDefault(props);
  const form = props.renderDefault({ ...props, groups: [], members: props.members.filter((m) => keep(m, only)) });
  const ref = params?.[SECTION_REF_PARAM];
  const lists = ref ? findSection(ref)?.items : undefined;
  if (!lists?.length) return form;
  return (
    <Stack space={5}>
      {form}
      <SectionItems lists={lists} />
    </Stack>
  );
}

/** Registered as the form's input component; only the document root is affected. */
export default function SectionInput(props: InputProps) {
  if (props.id === "root" && props.schemaType.jsonType === "object") return <RootInput {...(props as ObjectInputProps)} />;
  return props.renderDefault(props);
}
