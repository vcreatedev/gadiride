import { defineField, defineType } from "sanity";

export const careerRole = defineType({
  name: "careerRole",
  title: "Career role",
  type: "document",
  fields: [
    defineField({ name: "role", title: "Role", type: "string", validation: (r) => r.required() }),
    defineField({ name: "detail", title: "Detail", type: "string", validation: (r) => r.required() }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 100 }),
  ],
  orderings: [{ title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "role", subtitle: "detail" } },
});
