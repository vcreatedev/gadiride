import { z } from "zod";
import type { Field } from "@/data/forms";

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export function isVisible(f: Field, values: Record<string, string>) {
  return !f.showIf || values[f.showIf.field] === f.showIf.equals;
}

export function buildSchema(fields: Field[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) shape[f.name] = z.string().optional().default("");
  return z.object(shape).superRefine((v: Record<string, string>, ctx) => {
    for (const f of fields) {
      if (!isVisible(f, v)) continue;
      const val = (v[f.name] ?? "").trim();
      if (f.required && !val) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.name], message: `Enter ${f.label.toLowerCase()}` });
        continue;
      }
      if (f.type === "date" && val && val < todayISO()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.name], message: "Choose today or a later date" });
      }
      if (f.notBefore && val && v[f.notBefore] && val < v[f.notBefore]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.name], message: "Return date must be on or after the pickup date" });
      }
      if (f.type === "number" && val) {
        const n = Number(val);
        if (Number.isNaN(n) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [f.name], message: `Enter a number from ${f.min} to ${f.max}` });
        }
      }
    }
  });
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[\s-]/g, ""))
    .refine((s) => /^(\+?91)?[6-9]\d{9}$/.test(s), "Enter a 10-digit Indian mobile number"),
});
export type Contact = z.infer<typeof contactSchema>;
