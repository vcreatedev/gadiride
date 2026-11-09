/**
 * Structured data (schema.org JSON-LD) for search engines and AI answer engines.
 * "<" is escaped so text from the admin can never close the script tag early.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
