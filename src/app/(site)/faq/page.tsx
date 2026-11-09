import PageHero from "@/components/PageHero";
import FaqList from "@/components/FaqList";
import { accent } from "@/components/Accent";
import { getFaq, getPage, pageMetadata } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import { faqLd } from "@/lib/structuredData";

export const generateMetadata = () => pageMetadata("faq");

export default async function FaqPage() {
  const [p, { items }] = await Promise.all([getPage("faq"), getFaq()]);
  return (
    <>
      {items.length > 0 && <JsonLd data={faqLd(items)} />}
      <PageHero title={accent(p.title)} intro={p.intro} bgPhoto={p.image} bgPhotoMobile={p.imageMobile} bgFit={p.imageFit} />
      <section className="section-y bg-white"><div className="container-x"><FaqList items={items} /></div></section>
    </>
  );
}
