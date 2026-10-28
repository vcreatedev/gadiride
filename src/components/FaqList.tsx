"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { FAQ } from "@/data/faq";

export default function FaqList({ items = FAQ }: { items?: typeof FAQ }) {
  return (
    <Accordion.Root type="single" collapsible className="border-t border-line">
      {items.map((f, i) => (
        <Accordion.Item key={f.q} value={`q${i}`} className="border-b border-line">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 px-4 py-5 text-left text-base text-ink-900 transition-colors hover:bg-surface-50 data-[state=open]:bg-surface-50 data-[state=open]:font-semibold md:text-lg">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[acc-up_.25s_ease-out] data-[state=open]:animate-[acc-down_.25s_ease-out]">
            <p className="max-w-[75ch] px-4 pb-6 pt-1 leading-relaxed">{f.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
