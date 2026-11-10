"use client";
import { useEffect, useState } from "react";
import { useClient, type StringInputProps } from "sanity";
import { apiVersion } from "./env";
import { site as builtIn } from "@/config/site";

type SiteContact = { whatsappNumber?: string; phone?: string };

/** The published Site settings WhatsApp and phone (what the website uses right now). */
function useSiteContact(): SiteContact | undefined {
  const client = useClient({ apiVersion });
  const [contact, setContact] = useState<SiteContact>();
  useEffect(() => {
    let alive = true;
    client
      .fetch<SiteContact | null>(`*[_id == "siteSettings"][0]{whatsappNumber, phone}`)
      .then((s) => alive && setContact(s ?? {}), () => alive && setContact({}));
    return () => { alive = false; };
  }, [client]);
  return contact;
}

/**
 * A vehicle's own WhatsApp or phone: when empty, the box shows the Site settings number the
 * website uses instead, so the admin sees where bookings go either way.
 */
export function SiteContactInput(props: StringInputProps) {
  const contact = useSiteContact();
  const isPhone = props.path[props.path.length - 1] === "phone";
  const fallback = !contact ? undefined : isPhone ? contact.phone ?? builtIn.phone : contact.whatsappNumber || builtIn.whatsappNumber;
  const placeholder = contact === undefined ? "" : fallback ? `Empty: ${fallback} (from Site settings)` : "Empty: no Call button (no phone in Site settings)";
  return props.renderDefault({ ...props, elementProps: { ...props.elementProps, placeholder } });
}
