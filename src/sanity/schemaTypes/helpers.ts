import { defineArrayMember, defineField } from "sanity";

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
export const sectionOrder = (list: readonly { key: string; title: string }[], group?: string) =>
  defineField({
    name: "layout",
    title: "Section order",
    type: "array",
    group,
    description: "Drag sections to reorder them. Switch off \"Show\" to hide one. The hero always stays at the top.",
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
