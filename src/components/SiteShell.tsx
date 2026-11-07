import Header from "./Header";
import Footer from "./Footer";
import Loader from "./Loader";
import SmoothScroll from "./SmoothScroll";
import ScrollReveal from "./ScrollReveal";
import QuoteFlow from "./QuoteFlow";
import WhatsAppFab from "./WhatsAppFab";
import { SiteProvider } from "./SiteProvider";
import { getGroups, getServices, getSettings, getTypes } from "@/lib/content";
import { dataset, sanityEnabled } from "@/sanity/env";

/** Header, footer, intro loader and quote dialog shared by every public page. */
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, groups, types, services] = await Promise.all([getSettings(), getGroups(), getTypes(), getServices()]);
  return (
    <SiteProvider value={{ settings, groups, types }}>
      <QuoteFlow>
        <Loader enabled={settings.showIntro} />
        <SmoothScroll />
        <ScrollReveal />
        <Header />
        <main id="main">{children}</main>
        <Footer settings={settings} groups={groups} services={services} />
        <WhatsAppFab />
        {sanityEnabled && dataset !== "production" && (
          <a
            href="/admin/"
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-40 rounded-full bg-taxi px-3 py-1.5 font-mono text-[11px] font-medium text-ink-900 shadow-lift"
            title="This site is showing the development dataset. gadiride.com is not affected."
          >
            DEV DATA · {dataset}
          </a>
        )}
      </QuoteFlow>
    </SiteProvider>
  );
}
