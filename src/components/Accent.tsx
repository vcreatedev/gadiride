/**
 * Renders a heading, colouring a trailing "." "?" or "!" in brand orange.
 * The last word and its mark never break apart, so the mark can't wrap onto a line alone.
 */
export function accent(text: string) {
  const m = text.match(/^([\s\S]*?)(\S*)([.?!])$/);
  return m ? (
    <>
      {m[1]}
      <span className="whitespace-nowrap">
        {m[2]}
        <span className="text-brand-500">{m[3]}</span>
      </span>
    </>
  ) : (
    text
  );
}
