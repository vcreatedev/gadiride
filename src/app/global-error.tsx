"use client";
import { useEffect } from "react";
import { isStaleBuildError, reloadForNewVersion } from "@/lib/staleBuild";

/**
 * Last resort, when even the main layout fails (it replaces the whole page, so it brings its own
 * html, body and plain styles). A tab on an older version reloads into the new one by itself.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (!(isStaleBuildError(error) && reloadForNewVersion())) console.error("[gadiride] app error", error.digest ?? "", error);
  }, [error]);
  const button = { height: 44, padding: "0 20px", borderRadius: 999, border: "1px solid #e5e5e5", font: "600 15px system-ui, sans-serif", cursor: "pointer" } as const;
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#fff", color: "#16161A" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#555", marginTop: 12 }}>Please try again. If it keeps happening, reload the page.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button type="button" onClick={reset} style={{ ...button, background: "#F47A16", color: "#fff", borderColor: "#F47A16" }}>Try again</button>
            <button type="button" onClick={() => window.location.reload()} style={{ ...button, background: "#fff" }}>Reload page</button>
          </div>
        </main>
      </body>
    </html>
  );
}
