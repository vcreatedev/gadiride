"use client";
import { useState, useId } from "react";
import { ChevronDown } from "lucide-react";
import RequestForm from "./RequestForm";
import type { FormKey } from "@/data/services";

/** A CTA that opens its request form in place. */
export default function ExpandForm({ formKey, label, dark = false }: { formKey: FormKey; label: string; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="mt-8">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={dark ? "btn bg-white text-ink-900 hover:bg-surface-100" : "btn-primary"}>
        {label}<ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={id} hidden={!open} className="mt-6 rounded-card bg-white p-5 text-ink-600 shadow-card ring-1 ring-line sm:p-7">
        {open && <RequestForm formKey={formKey} idPrefix={`svc-${formKey}`} compact />}
      </div>
    </div>
  );
}
