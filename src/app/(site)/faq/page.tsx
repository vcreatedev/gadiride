import PageHero from "@/components/PageHero";
import FaqList from "@/components/FaqList";
import { accent } from "@/components/Accent";
import { getFaq, getPage, pageMetadata } from "@/lib/content";

export const generateMetadata = () => pageMetadata("faq");

export default async function FaqPage() {
  const [p, { items }] = await Promise.all([getPage("faq"), getFaq()]);
  return (
    <>
      <PageHero title={accent(p.title)} intro={p.intro} />
      <section className="section-y bg-white"><div className="container-x"><FaqList items={items} /></div></section>
    </>
  );
}
