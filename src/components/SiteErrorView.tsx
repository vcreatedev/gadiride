"use client";
import { useEffect, useState } from "react";
import { isStaleBuildError, reloadForNewVersion } from "@/lib/staleBuild";

type Props = { error: Error & { digest?: string }; reset: () => void };

/**
 * Shown instead of Next.js's bare "Application error" screen. A tab running an older version of
 * the site (after a new one was published) reloads into the current version by itself; any other
 * problem shows a friendly message with Try again, Reload and Home.
 */
export default function SiteErrorView({ error, reset }: Props) {
  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    if (isStaleBuildError(error) && reloadForNewVersion()) {
      setReloading(true);
      return;
    }
    console.error("[gadiride] page error", error.digest ?? "", error);
  }, [error]);

  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center bg-surface-0 px-6 py-24 text-center">
      <h1 className="font-head text-3xl font-semibold text-ink-900 md:text-4xl">
        {reloading ? "Loading the latest version…" : "Something went wrong"}
      </h1>
      <p className="mt-3 max-w-md text-ink-600">
        {reloading
          ? "Gadiride was just updated. This page is reloading with the new version."
          : "This page hit a problem. Please try again. If it keeps happening, reload the page."}
      </p>
      {!reloading && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary h-12 rounded-full px-6 text-[15px]">Try again</button>
          <button type="button" onClick={() => window.location.reload()} className="h-12 rounded-full border border-line bg-white px-6 text-[15px] font-semibold text-ink-900 hover:bg-surface-50">Reload page</button>
          <a href="/" className="flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-ink-600 underline-offset-4 hover:underline">Home</a>
        </div>
      )}
    </section>
  );
}
