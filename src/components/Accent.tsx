/** Renders a heading, colouring a trailing "." "?" or "!" in brand orange. */
export function accent(text: string) {
  const m = text.match(/^([\s\S]*?)([.?!])$/);
  return m ? (
    <>
      {m[1]}
      <span className="text-brand-500">{m[2]}</span>
    </>
  ) : (
    text
  );
}
