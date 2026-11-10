"use client";
import { useEffect } from "react";
import { isStaleBuildError, reloadForNewVersion } from "@/lib/staleBuild";

/**
 * A tab still running an older version of the site can fail to load a file outside page rendering
 * (on a click, or while preloading a page). When that happens, load the current version once.
 */
export default function StaleBuildGuard() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => { if (isStaleBuildError(e.error ?? e.message)) reloadForNewVersion(); };
    const onRejection = (e: PromiseRejectionEvent) => { if (isStaleBuildError(e.reason)) reloadForNewVersion(); };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
