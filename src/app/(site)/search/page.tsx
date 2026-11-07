import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, SearchX, Users, X } from "lucide-react";
import BookingCard from "@/components/BookingCard";
import ResultCard from "@/components/search/ResultCard";
import DriverCard from "@/components/search/DriverCard";
import RequestButton from "@/components/search/RequestButton";
import { accent } from "@/components/Accent";
import { FORMS, applyFormOverride } from "@/data/forms";
import type { GroupId, Vehicle } from "@/data/vehicles";
import { getDrivers, getGroups, getPage, getSearchBar, getSettings, getVehicles, pageMetadata } from "@/lib/content";
import { bookedDays, pickFormValues, requestEntries, withFormDefaults } from "@/lib/request";
import { TAB_IDS, matchDrivers, matchVehicles, type TabId } from "@/lib/search";

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await pageMetadata("search")), robots: { index: false, follow: true } };
}

const NOUN: Record<TabId, [string, string]> = {
  cars: ["car", "cars"],
  passenger: ["vehicle", "vehicles"],
  logistics: ["truck", "trucks"],
  equipment: ["machine", "machines"],
  driver: ["driver", "drivers"],
};

type SP = Promise<Record<string, string | string[] | undefined>>;


export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tab: TabId = TAB_IDS.includes(sp.tab as TabId) ? (sp.tab as TabId) : "cars";
  // Only what the visitor changed is in the link; the rest are the form's defaults.
  const picked = pickFormValues(tab, sp);
  const [p, settings, groups, bar, vp] = await Promise.all([getPage("search"), getSettings(), getGroups(), getSearchBar(), getPage("vehicles")]);
  // The form as edited in the admin (labels and message title in the WhatsApp request).
  const form = applyFormOverride(FORMS[tab], bar.forms[tab]);
  // A plain link (no search yet) lists everything; a search fills in the defaults it left out.
  const values = withFormDefaults(form.fields, picked);
  const entries = requestEntries(tab, values, form.fields);
  const title = form.title;
  let [one, many] = NOUN[tab];
  const requestLabel = `${p.requestCta} ${one}`;
  const filtered = Object.keys(picked).length > 0;
  const dark = settings.heroTheme === "dark";
  const serviceHref = tab === "driver" ? "/drivers/" : `/vehicles/${tab}/`;
  const browseHref = tab === "driver" ? "/drivers/" : `${serviceHref}#all`;
  const heading =tab === "driver" ? "Drivers" : groups.find((g) => g.id === tab)?.name ?? p.title.replace(/\.$/, "");

  let results: React.ReactNode;
  if (tab === "driver") {
    const drivers = matchDrivers(values, await getDrivers());
    results = drivers.length ? (
      <>
        <h2 className="font-head text-2xl font-semibold text-ink-900 md:text-3xl">{p.driversTitle}</h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {drivers.map((d) => (
            <li key={d.name}><DriverCard d={d} title={title} entries={entries} requestLabel={requestLabel} /></li>
          ))}
        </ul>
      </>
    ) : (
      <Empty title={p.driversTitle} text={p.driversEmpty} icon={Users}>
        <RequestButton title={title} entries={entries} label={p.driversEmptyCta} className="mt-6" />
      </Empty>
    );
  } else {
    const { exact, others, upsized, outside } = matchVehicles(tab as GroupId, values, await getVehicles(), settings.areas);
    // More people than any car seats: same page, listing the tempo travellers and buses that fit.
    if (upsized) [one, many] = NOUN.passenger;
    const groupName = groups.find((g) => g.id === tab)?.name ?? many;
    const grid = (list: Vehicle[], first = false) => (
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v, i) => (
          <li key={v.slug}>
            <ResultCard v={v} title={title} entries={entries} detailsLabel={p.detailsLabel} showPrices={settings.showPrices} priority={first && i < 3} days={tab === "cars" ? bookedDays(values) : 1} />
          </li>
        ))}
      </ul>
    );
    results = exact.length ? (
      <>
        <h2 className="font-head text-2xl font-semibold text-ink-900 md:text-3xl">
          <span className="text-gradient">{exact.length}</span> {exact.length === 1 ? one : many} {p.resultsTitle}
        </h2>
        {grid(exact, true)}
        {others.length > 0 && (
          <div className="mt-16">
            <h2 className="font-head text-xl font-semibold text-ink-900">{p.othersTitle}</h2>
            {grid(others)}
          </div>
        )}
      </>
    ) : (
      <>
        <Empty title={outside ? vp.outsideTitle : p.noMatchTitle} text={outside ? vp.outsideText : p.noMatchText}>
          <RequestButton title={title} entries={entries} label={`${p.requestCta} ${one}`} className="mt-6" />
        </Empty>
        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="font-head text-xl font-semibold text-ink-900">{groupName}</h2>
            {grid(others, true)}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <section className={`relative pb-24 pt-[104px] md:pt-[120px] ${dark ? "bg-ink-900" : "bg-[linear-gradient(180deg,#FFF4E6_0%,#FFFFFF_100%)]"}`}>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgba(244,122,22,0.18),transparent_60%)]" />
        <div className="container-x relative">
          <h1 className={`display text-4xl md:text-5xl ${dark ? "text-white" : "text-ink-900"}`}>{accent(`${heading}.`)}</h1>
          <p className={`mt-2 max-w-[60ch] ${dark ? "text-ink-300" : "text-ink-600"}`}>{p.intro}</p>
        </div>
      </section>
      <div className="container-x relative z-10 -mt-16">
        <BookingCard key={JSON.stringify(sp)} lockTab={tab} initialValues={values} />
      </div>

      <section className="bg-surface-50 pb-20 pt-10 md:pb-28">
        <div className="container-x">
          <nav aria-label="Search options" className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
            <p className="text-sm text-ink-600">{filtered ? "Showing results for your trip details." : `Showing all ${many}.`}</p>
            <div className="flex flex-wrap items-center gap-2">
              {filtered && (
                <Link href={serviceHref} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-700 ring-1 ring-line transition-colors hover:bg-surface-50">
                  <X className="h-4 w-4" />Clear search
                </Link>
              )}
              <Link href={browseHref} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-700">
                Browse all {many}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
          {results}
          <p className="mt-10 flex items-start gap-2 text-sm text-ink-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            {p.availabilityNote}
          </p>
        </div>
      </section>
    </>
  );
}

function Empty({ title, text, children, icon: Icon = SearchX }: { title: string; text: string; children?: React.ReactNode; icon?: typeof SearchX }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-ink-300/60 bg-white px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-7 w-7" /></span>
      <h2 className="mt-5 font-head text-2xl font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-[52ch] text-ink-600">{text}</p>
      {children}
    </div>
  );
}
