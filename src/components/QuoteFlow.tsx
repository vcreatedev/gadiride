"use client";
import { createContext, useCallback, useContext, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Pencil, Phone, CheckCircle2 } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { contactSchema, type Contact } from "@/lib/schema";
import { buildMessage, whatsappHref, type Entry } from "@/lib/whatsapp";
import { site } from "@/config/site";

type Request = { title: string; entries: Entry[] };
type Ctx = { openQuote: (r: Request) => void };
const QuoteCtx = createContext<Ctx>({ openQuote: () => {} });
export const useQuote = () => useContext(QuoteCtx);

type Step = "contact" | "summary" | "sent";

export default function QuoteFlow({ children }: { children: React.ReactNode }) {
  const [req, setReq] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<Contact | null>(null);
  const form = useForm<Contact>({ resolver: zodResolver(contactSchema), defaultValues: { name: "", phone: "" } });

  const openQuote = useCallback((r: Request) => {
    setReq(r);
    setStep("contact");
    setOpen(true);
  }, []);

  const href = req && contact ? whatsappHref(buildMessage(req.title, req.entries, contact)) : "#";

  return (
    <QuoteCtx.Provider value={{ openQuote }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink-900/60 backdrop-blur-sm data-[state=open]:animate-[fade_.2s_ease-out]" />
          <Dialog.Content
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 z-[90] max-h-[92dvh] overflow-y-auto rounded-t-card bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-float focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(560px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-600">{req?.title}</p>
                <Dialog.Title className="mt-1 font-head text-2xl font-bold text-ink-900">
                  {step === "contact" && "Where should we send your quote?"}
                  {step === "summary" && "Check your request"}
                  {step === "sent" && "Finish in WhatsApp"}
                </Dialog.Title>
              </div>
              <Dialog.Close className="-m-2 rounded-full p-2 text-ink-600 hover:bg-surface-50" aria-label="Close">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <ol className="mb-6 flex gap-2" aria-label="Progress">
              {(["contact", "summary", "sent"] as Step[]).map((s, i) => (
                <li key={s} className={`h-1 flex-1 rounded-full ${["contact", "summary", "sent"].indexOf(step) >= i ? "bg-brand-500" : "bg-surface-100"}`}>
                  <span className="sr-only">Step {i + 1}</span>
                </li>
              ))}
            </ol>

            {step === "contact" && (
              <form
                noValidate
                onSubmit={form.handleSubmit((c) => { setContact(c); setStep("summary"); })}
                className="space-y-4"
              >
                <Dialog.Description className="text-sm text-ink-600">We only use these to reply to your request.</Dialog.Description>
                <div>
                  <label htmlFor="q-name" className="label">Your name</label>
                  <input id="q-name" autoComplete="name" className="field" aria-invalid={!!form.formState.errors.name} aria-describedby="q-name-err" {...form.register("name")} />
                  {form.formState.errors.name && <p id="q-name-err" role="alert" className="mt-1.5 text-sm text-err">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="q-phone" className="label">Mobile number</label>
                  <input id="q-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className="field" aria-invalid={!!form.formState.errors.phone} aria-describedby="q-phone-err" {...form.register("phone")} />
                  {form.formState.errors.phone && <p id="q-phone-err" role="alert" className="mt-1.5 text-sm text-err">{form.formState.errors.phone.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full">Review request</button>
              </form>
            )}

            {step === "summary" && req && contact && (
              <div>
                <Dialog.Description className="sr-only">Review the details before opening WhatsApp.</Dialog.Description>
                <dl className="divide-y divide-line rounded-field border border-line bg-surface-50 px-4">
                  {[...req.entries.filter((e) => e.value), { label: "Name", value: contact.name }, { label: "Mobile", value: contact.phone }].map((e) => (
                    <div key={e.label} className="flex justify-between gap-6 py-3 text-sm">
                      <dt className="text-ink-600">{e.label}</dt>
                      <dd className="text-right font-semibold text-ink-900">{e.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm text-ink-600">This sends a request. Your booking is confirmed only after our team replies.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-[auto_1fr]">
                  <button type="button" onClick={() => setStep("contact")} className="btn-secondary"><Pencil className="h-4 w-4" />Edit</button>
                  <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setStep("sent")} className="btn-whatsapp">
                    <WhatsAppIcon className="h-5 w-5" />Continue on WhatsApp
                  </a>
                </div>
                {site.phone && (
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-900 underline underline-offset-4">
                    <Phone className="h-4 w-4" />Call instead
                  </a>
                )}
              </div>
            )}

            {step === "sent" && (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-whatsapp" />
                <Dialog.Description className="mx-auto mt-4 max-w-[38ch] text-ink-600">
                  WhatsApp opened in a new tab with your request written out. Press send there and our team will reply with availability and price.
                </Dialog.Description>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a href={href} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">Open WhatsApp again</a>
                  <Dialog.Close className="btn-secondary">Done</Dialog.Close>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </QuoteCtx.Provider>
  );
}
