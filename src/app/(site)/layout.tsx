import SiteShell from "@/components/SiteShell";

/**
 * Every page is pre-built and served from Vercel's edge cache, then rebuilt in the background at
 * most once a minute (from the cached content, no extra Sanity calls) so timers switch on time.
 */
export const revalidate = 60;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
