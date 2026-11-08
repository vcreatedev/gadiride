import PageHero from "@/components/PageHero";
import BookingCard from "@/components/BookingCard";
import DriversBrowser from "@/components/DriversBrowser";
import { accent } from "@/components/Accent";
import { HERO_VARIANTS } from "@/data/vehicles";
import { getDrivers, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("drivers");

export default async function DriversPage() {
  const [p, drivers, search, vp] = await Promise.all([getPage("drivers"), getDrivers(), getPage("search"), getPage("vehicles")]);
  return (
    <>
      <PageHero full driver scene="street" bgPhoto={p.image} bgPhotoMobile={p.imageMobile} bgFit={p.imageFit} variants={HERO_VARIANTS.driver} title={accent(p.title)} intro={p.intro} art="sedan" color="#FFC20E" bottom={<BookingCard lockTab="driver" />} />
      {/* A search in the bar above filters this list in place (same as the vehicle pages). */}
      <section id="all" className="scroll-mt-20 bg-surface-50 py-10 md:py-14">
        <div className="container-x">
          <DriversBrowser
            drivers={drivers}
            texts={{ title: p.listTitle, empty: p.empty, outsideTitle: vp.outsideTitle, outsideText: vp.outsideText, requestLabel: `${search.requestCta} driver` }}
          />
        </div>
      </section>
    </>
  );
}
