import { defineArrayMember, defineField } from "sanity";
import { FORMS } from "@/data/forms";
import type { FormKey } from "@/data/services";

/** Small builders so the page schemas stay readable. */
type Opt = { group?: string; description?: string; required?: boolean; rows?: number };

const req = (o: Opt) => (o.required ? { validation: (r: { required: () => unknown }) => r.required() } : {});

export const str = (name: string, title: string, o: Opt = {}) =>
  defineField({ name, title, type: "string", group: o.group, description: o.description, ...(req(o) as object) });

export const txt = (name: string, title: string, o: Opt = {}) =>
  defineField({ name, title, type: "text", rows: o.rows ?? 3, group: o.group, description: o.description, ...(req(o) as object) });

export const img = (name: string, title: string, o: Opt = {}) =>
  defineField({
    name,
    title,
    type: "image",
    group: o.group,
    description: o.description,
    options: { hotspot: true },
    fields: [defineField({ name: "alt", title: "Alt text (describe the image)", type: "string" })],
  });

export const strList = (name: string, title: string, o: Opt = {}) =>
  defineField({ name, title, type: "array", group: o.group, description: o.description, of: [defineArrayMember({ type: "string" })] });

export const titleTextList = (name: string, title: string, o: Opt & { extra?: ReturnType<typeof str>[] } = {}) =>
  defineField({
    name,
    title,
    type: "array",
    group: o.group,
    description: o.description,
    of: [
      defineArrayMember({
        type: "object",
        name: "item",
        fields: [str("title", "Title", { required: true }), txt("text", "Text", { rows: 2 }), ...(o.extra ?? [])],
        preview: { select: { title: "title", subtitle: "text" } },
      }),
    ],
  });

export const seo = (group = "seo") =>
  defineField({
    name: "seo",
    title: "Search & sharing",
    type: "object",
    group,
    options: { collapsible: true, collapsed: false },
    fields: [
      str("title", "Page title (browser tab and Google)"),
      txt("description", "Description (Google and social previews)", { rows: 2 }),
      img("image", "Share image (1200 × 630)"),
    ],
  });

export const section = (name: string, title: string, fields: ReturnType<typeof defineField>[], group?: string) =>
  defineField({ name, title, type: "object", group: group ?? name, options: { collapsible: true, collapsed: false }, fields });

export const HEADING_HINT = 'End a heading with "." or "?" to show that character in brand orange.';

/** Drag to reorder, switch off to hide. The page hero always stays on top. */
type OrderOpt = { name?: string; title?: string; description?: string };
export const sectionOrder = (list: readonly { key: string; title: string }[], group?: string, o: OrderOpt = {}) =>
  defineField({
    name: o.name ?? "layout",
    title: o.title ?? "Section order",
    type: "array",
    group,
    description: o.description ?? "Drag sections to reorder them. Switch off \"Show\" to hide one. The hero always stays at the top.",
    of: [
      defineArrayMember({
        type: "object",
        name: "section",
        fields: [
          defineField({ name: "key", title: "Section", type: "string", options: { list: list.map((s) => ({ title: s.title, value: s.key })) }, validation: (r) => r.required() }),
          defineField({ name: "show", title: "Show", type: "boolean", initialValue: true }),
        ],
        preview: {
          select: { key: "key", show: "show" },
          prepare: ({ key, show }) => ({ title: list.find((s) => s.key === key)?.title ?? key, subtitle: show === false ? "Hidden" : "Shown" }),
        },
      }),
    ],
  });

/** A list of links (label + page path or full URL). */
export const linkList = (name: string, title: string, o: Opt = {}) =>
  defineField({
    name,
    title,
    type: "array",
    group: o.group,
    description: o.description,
    of: [
      defineArrayMember({
        type: "object",
        name: "link",
        fields: [str("label", "Label", { required: true }), str("href", "Link", { required: true, description: "A page like /about/ or a full URL" })],
        preview: { select: { title: "label", subtitle: "href" } },
      }),
    ],
  });

/** Offer banners (Home → Offers & deals). Each one can also show on one vehicle page. */
export const offerBanners = (name = "banners", o: { hidden?: boolean; description?: string } = {}) =>
  defineField({
    name,
    title: "Banners",
    type: "array",
    hidden: o.hidden,
    description: o.description ?? "All banners show here. Each also shows on the page picked in “Also show on”.",
    of: [
      defineArrayMember({
        type: "object",
        name: "banner",
        fields: [
          str("eyebrow", "Small label", { description: "e.g. Self drive, Airport" }),
          str("title", "Title", { required: true }),
          txt("text", "Text", { rows: 2 }),
          str("cta", "Button label"),
          str("href", "Button link", { description: 'A page like /vehicles/cars/#all, or "tel" to call, or "whatsapp" to chat.' }),
          defineField({ name: "tone", title: "Colour", type: "string", options: { list: [{ title: "Orange", value: "brand" }, { title: "Dark", value: "dark" }, { title: "Yellow", value: "taxi" }], layout: "radio" }, initialValue: "brand" }),
          defineField({ name: "art", title: "Vehicle drawing", type: "string", options: { list: ["hatch", "sedan", "suv", "van", "bus", "pickup", "truck", "jcb"] }, initialValue: "sedan" }),
          str("color", "Vehicle colour", { description: "Hex, e.g. #FFC20E" }),
          defineField({ name: "group", title: "Also show on", type: "string", options: { list: ["cars", "passenger", "logistics", "equipment", "driver"] }, initialValue: "cars" }),
        ],
        preview: { select: { title: "title", subtitle: "group" } },
      }),
    ],
  });

/**
 * A request form's texts and fields. The fields themselves are fixed in code (src/data/forms.ts);
 * here they can be renamed, reordered, hidden (eye), made optional, and their choices edited.
 */
export const formSettings = (key: FormKey) => {
  const base = FORMS[key];
  const hasChoices = (name?: string) => Boolean(base.fields.find((f) => f.name === name)?.options);
  return defineField({
    name: "form",
    title: "Form",
    type: "object",
    options: { collapsible: true, collapsed: false },
    fields: [
      str("title", "Message title", { description: `Top line of the WhatsApp message. Empty = "${base.title}".` }),
      str("cta", "Button label", { description: `Empty = "${base.cta}".` }),
      defineField({
        name: "fields",
        title: "Fields",
        type: "array",
        description: "Drag to reorder, eye to hide. Empty = the form as built.",
        of: [
          defineArrayMember({
            type: "object",
            name: "formField",
            fields: [
              defineField({ name: "name", title: "Field", type: "string", readOnly: true, options: { list: base.fields.map((f) => ({ title: f.label, value: f.name })) } }),
              str("label", "Label"),
              str("placeholder", "Hint inside the box"),
              defineField({ name: "options", title: "Choices", type: "array", of: [{ type: "string" }], hidden: ({ parent }) => !hasChoices((parent as { name?: string })?.name) }),
              defineField({ name: "required", title: "Required", type: "boolean" }),
            ],
            preview: {
              select: { label: "label", name: "name", required: "required" },
              prepare: ({ label, name, required }) => ({
                title: label || base.fields.find((f) => f.name === name)?.label || name,
                subtitle: required ? "Required" : "Optional",
              }),
            },
          }),
        ],
      }),
    ],
  });
};
