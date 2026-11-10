"use client";
import SiteErrorView from "@/components/SiteErrorView";

/** Any error on a site page: reload into the new version, or a friendly message (see SiteErrorView). */
export default function SiteError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SiteErrorView {...props} />;
}
