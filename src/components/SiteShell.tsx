import Header from "./Header";
import Footer from "./Footer";
import Loader from "./Loader";
import { introSkipScript } from "@/lib/intro";
import SmoothScroll from "./SmoothScroll";
import ScrollReveal from "./ScrollReveal";
import QuoteFlow from "./QuoteFlow";
import WhatsAppFab from "./WhatsAppFab";
import { SiteProvider } from "./SiteProvider";
import { getGroups, getServices, getSettings, getTypes, getSearchBar, getVehicles } from "@/lib/content";
import { dataset, sanityEnabled } from "@/sanity/env";
import JsonLd from "./JsonLd";
import { organizationLd, websiteLd } from "@/lib/structuredData";

/** Header, footer, intro loader and quote dialog shared by every public page. */
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, groups, types, services, searchBar, vehicles] = await Promise.all([getSettings(), getGroups(), getTypes(), getServices(), getSearchBar(), getVehicles()]);
  return (
    <SiteProvider value={{ settings, groups, types, searchBar }}>
      <QuoteFlow>
        {/* Who Gadiride is, where it rents and how to reach it, for Google and AI answer engines. */}
        <JsonLd data={[organizationLd(settings, groups, vehicles), websiteLd(settings)]} />
        {/* Before the first paint: a visitor who saw the intro recently skips it (no flash of the overlay). */}
        {settings.showIntro && <script dangerouslySetInnerHTML={{ __html: introSkipScript(settings.introRepeat) }} />}
        <Loader enabled={settings.showIntro} repeat={settings.introRepeat} />
        <SmoothScroll />
        <ScrollReveal />
        {/* Boxed site: on screens wider than the content, everything stays inside this frame. */}
        <div className="site-frame">
          <Header />
          <main id="main">{children}</main>
          <Footer settings={settings} groups={groups} services={services} />
        </div>
        <WhatsAppFab />
        {sanityEnabled && dataset !== "production" && (
          <a
            href="/admin/"
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[calc(var(--frame-gap)+1.25rem)] z-40 rounded-full bg-taxi px-3 py-1.5 font-mono text-[11px] font-medium text-ink-900 shadow-lift"
            title="Test site: gadiride.com's live content plus the edits made in this site's admin (removed after an hour). gadiride.com is not affected."
          >
            TEST SITE · live data + test edits
          </a>
        )}
      </QuoteFlow>
    </SiteProvider>
  );
}
