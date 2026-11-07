import type { SchemaTypeDefinition } from "sanity";

/**
 * Show / hide for everything the editor manages:
 *  - documents listed under a section (reviews, FAQs, services...) get "Hide on website"
 *    (vehicles and drivers already have "Available");
 *  - every item of a list inside a form (slides, cards, banners, steps...) gets a `hidden`
 *    flag, switched with the eye on the item's row (see VisibilityItem.tsx).
 * The website skips hidden ones (see content.ts).
 */
type Field = { name: string; type: string; fields?: Field[]; of?: Field[]; [k: string]: unknown };

export const HIDDEN_FIELD = "hidden";

/** Document types whose items can be hidden from their section list. */
const HIDEABLE_DOCS = new Set(["faq", "testimonial", "service", "careerRole", "vehicleType"]);

/** Array items that already have their own switch (section order rows use "show"). */
const SKIP_MEMBERS = new Set(["section"]);

const docFlag: Field = {
  name: HIDDEN_FIELD,
  title: "Hide on website",
  type: "boolean",
  description: "Also switched with the eye in the page's section list.",
};
const itemFlag: Field = { name: HIDDEN_FIELD, title: "Hidden on website", type: "boolean", hidden: true };

const addFlag = (fields: Field[], flag: Field) => (fields.some((f) => f.name === HIDDEN_FIELD) ? fields : [...fields, flag]);

function walk(field: Field): Field {
  if (field.type === "array" && Array.isArray(field.of)) {
    return {
      ...field,
      of: field.of.map((m) =>
        Array.isArray(m.fields) && !SKIP_MEMBERS.has(m.name) ? { ...m, fields: addFlag(m.fields.map(walk), itemFlag) } : m,
      ),
    };
  }
  if (Array.isArray(field.fields)) return { ...field, fields: field.fields.map(walk) };
  return field;
}

export function withVisibility(type: SchemaTypeDefinition): SchemaTypeDefinition {
  const t = type as unknown as { name: string; fields?: Field[] };
  if (!Array.isArray(t.fields)) return type;
  const fields = t.fields.map(walk);
  return { ...t, fields: HIDEABLE_DOCS.has(t.name) ? addFlag(fields, docFlag) : fields } as unknown as SchemaTypeDefinition;
}
