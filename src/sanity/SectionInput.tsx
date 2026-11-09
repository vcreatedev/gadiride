"use client";
import { useEffect } from "react";
import { ALL_FIELDS_GROUP, type ArrayOfObjectsInputProps, type InputProps, type ObjectInputProps, type ObjectMember } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { Stack, Text } from "@sanity/ui";
import { findSection } from "./pageMap";
import SectionItems from "./SectionItems";
import ImageAddressInput, { isImageType } from "./ImageAddressInput";
import ImageListAddressInput, { imageItemType } from "./ImageListAddressInput";

/**
 * When a document is opened from a page section in the sidebar (e.g. Header → Logo), the pane
 * carries `fields=headerLogo,...` and the form shows only those fields, without tabs.
 * Opened any other way (Site settings, a vehicle...), the form is the normal full form.
 */
export const SECTION_FIELDS_PARAM = "fields";
/** "page/section": the form also lists that section's documents (reviews, FAQs...) under its fields. */
export const SECTION_REF_PARAM = "section";
/** Service id: offer banners are filtered to the ones shown on that service's page. */
export const BANNER_GROUP_PARAM = "offersFor";

/** A field is kept when listed, or when one of its own fields is listed ("offers.banners"). */
const listed = (name: string, only: Set<string>) => only.has(name) || [...only].some((f) => f.startsWith(`${name}.`));

const keep = (m: ObjectMember, only: Set<string>) => {
  if (m.kind === "field") return listed(m.name, only);
  if (m.kind === "fieldSet") return m.fieldSet.members.some((f) => f.kind === "field" && only.has(f.name));
  return false;
};

/** The section the pane was opened from, and its field list (looked up from the ref, not the URL list). */
function useSection() {
  const { params } = usePaneRouter();
  const ref = params?.[SECTION_REF_PARAM];
  const section = ref ? findSection(ref) : undefined;
  const fromSection = section?.target.kind === "doc" && section.target.fields.length ? section.target.fields.join(",") : undefined;
  return { section, raw: fromSection ?? params?.[SECTION_FIELDS_PARAM] };
}

function RootInput(props: ObjectInputProps) {
  const { section, raw } = useSection();
  const only = raw ? new Set(raw.split(",")) : null;
  const selected = props.groups.find((g) => g.selected)?.name;
  const { onFieldGroupSelect, groups } = props;

  // Section fields can sit in any tab, so look at all fields and filter from there.
  useEffect(() => {
    if (raw && groups.length && selected !== ALL_FIELDS_GROUP.name) onFieldGroupSelect(ALL_FIELDS_GROUP.name);
  }, [raw, groups.length, selected, onFieldGroupSelect]);

  if (!only) return props.renderDefault(props);
  const form = props.renderDefault({ ...props, groups: [], members: props.members.filter((m) => keep(m, only)) });
  const lists = section?.items;
  return (
    <Stack space={5}>
      {form}
      {lists?.length ? <SectionItems lists={lists} /> : null}
    </Stack>
  );
}

/** Inside a listed object (e.g. "offers.banners"): only the listed fields of it. */
function NestedFilter(props: ObjectInputProps) {
  const { raw } = useSection();
  const name = String(props.path[0]);
  const inner = raw ? raw.split(",").filter((f) => f.startsWith(`${name}.`)).map((f) => f.slice(name.length + 1)) : [];
  if (!inner.length) return props.renderDefault(props);
  const only = new Set(inner);
  return props.renderDefault({ ...props, members: props.members.filter((m) => keep(m, only)) });
}

/** Offer banners opened from a service page: only the banners set to show there ("Also show on"). */
function BannerFilter(props: ArrayOfObjectsInputProps) {
  const group = useSection().section?.params?.[BANNER_GROUP_PARAM];
  if (!group) return props.renderDefault(props);
  const members = props.members.filter((m) => m.kind !== "item" || ((m.item.value as { group?: string }).group || "cars") === group);
  return (
    <Stack space={3}>
      <Text size={1} muted>Only the banners shown on this page. New banners: set “Also show on” to this page. All banners: Home → Offers & deals.</Text>
      {props.renderDefault({ ...props, members })}
    </Stack>
  );
}

/** Registered as the form's input component: the document root (section filtering) and image fields. */
export default function SectionInput(props: InputProps) {
  if (props.id === "root" && props.schemaType.jsonType === "object") return <RootInput {...(props as ObjectInputProps)} />;
  if (props.path.length === 1 && props.schemaType.jsonType === "object") return <NestedFilter {...(props as ObjectInputProps)} />;
  if (props.schemaType.jsonType === "array" && props.path[props.path.length - 1] === "banners") return <BannerFilter {...(props as ArrayOfObjectsInputProps)} />;
  // Every image field also takes a pasted image address or a copied image.
  if (isImageType(props.schemaType)) return <ImageAddressInput {...(props as ObjectInputProps)} />;
  // Every list of photos (e.g. a vehicle's "More photos") also adds photos from image links.
  if (imageItemType(props.schemaType)) return <ImageListAddressInput {...(props as ArrayOfObjectsInputProps)} />;
  return props.renderDefault(props);
}
