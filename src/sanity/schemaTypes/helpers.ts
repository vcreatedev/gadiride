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
