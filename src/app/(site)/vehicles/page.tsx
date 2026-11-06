import PageHero from "@/components/PageHero";
import VehiclesBrowser from "@/components/VehiclesBrowser";
import { accent } from "@/components/Accent";
import { getPage, getSettings, getVehicles, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("vehicles");

export default async function VehiclesPage() {
  const [p, vehicles, site] = await Promise.all([getPage("vehicles"), getVehicles(), getSettings()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} art="suv" color="#2E2E34" />
      <section className="section-y bg-surface-50">
        <div className="container-x">
          <VehiclesBrowser vehicles={vehicles} showPrices={site.showPrices} empty={{ title: p.emptyTitle, text: p.emptyText }} />
        </div>
      </section>
    </>
  );
}
