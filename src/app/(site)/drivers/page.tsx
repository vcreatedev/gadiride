import PageHero from "@/components/PageHero";
import BookingCard from "@/components/BookingCard";
import DriverCard from "@/components/search/DriverCard";
import { accent } from "@/components/Accent";
import { FORMS } from "@/data/forms";
import { HERO_VARIANTS } from "@/data/vehicles";
import { getDrivers, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("drivers");

export default async function DriversPage() {
  const [p, drivers, search] = await Promise.all([getPage("drivers"), getDrivers(), getPage("search")]);
  return (
    <>
      <PageHero full driver scene="street" bgPhoto={p.image} bgPhotoMobile={p.imageMobile} bgFit={p.imageFit} variants={HERO_VARIANTS.driver} title={accent(p.title)} intro={p.intro} art="sedan" color="#FFC20E" bottom={<BookingCard lockTab="driver" />} />
      <section className="bg-surface-50 py-14 md:py-20">
        <div className="container-x">
          <h2 className="font-head text-2xl font-semibold text-ink-900 md:text-3xl">{p.listTitle}</h2>
          {drivers.length ? (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {drivers.map((d) => (
                <li key={d.name}>
                  <DriverCard d={d} title={FORMS.driver.title} entries={[]} requestLabel={`${search.requestCta} driver`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 max-w-[60ch] text-ink-600">{p.empty}</p>
          )}
        </div>
      </section>
    </>
  );
}
