/**
 * After a new version of the site is published, a tab opened before it still runs the old version;
 * its next click asks for files of that old version, which no longer exist. Next.js then stops with
 * "Application error". These helpers recognise that case and load the current version instead.
 */
const STALE_BUILD =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to load chunk/i;
const RELOADED_AT_KEY = "ga-new-version-reload";
/** Never reload again within this time, so a real fault can never cause a reload loop. */
const MIN_RELOAD_GAP_MS = 30_000;

/** True when the error means "this tab is running an older version of the site". */
export function isStaleBuildError(error: unknown): boolean {
  if (!error) return false;
  const e = error as { name?: unknown; message?: unknown };
  return STALE_BUILD.test(`${String(e.name ?? "")} ${String(e.message ?? error)}`);
}

/** Loads the current version once. False when it already did so a moment ago, or cannot tell. */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOADED_AT_KEY) ?? 0);
    if (Date.now() - last < MIN_RELOAD_GAP_MS) return false;
    sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()));
  } catch {
    return false; // storage blocked: without the guard a reload could repeat, so show the error page
  }
  window.location.reload();
  return true;
}
