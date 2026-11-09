import type { IntroRepeat } from "./content";

/** When this visitor last saw the logo intro (local storage for "daily", session storage for "session"). */
export const INTRO_SEEN_KEY = "ga-intro-seen";
const DAY_MS = 86_400_000;

/**
 * Inline script that runs before the first paint: if this visitor saw the intro recently, it marks the
 * page (html.intro-skip) so CSS hides the loader at once (no flash) and the Loader skips to the site.
 * Shared by the server (which writes it into the page) and the Loader (which reads the mark).
 */
export function introSkipScript(repeat: IntroRepeat): string {
  return `try{var m=${JSON.stringify(repeat)},s=m==="session"?sessionStorage:localStorage,t=+(s.getItem("${INTRO_SEEN_KEY}")||0);if(m!=="every"&&t&&(m==="session"||Date.now()-t<${DAY_MS}))document.documentElement.classList.add("intro-skip")}catch(e){}`;
}
