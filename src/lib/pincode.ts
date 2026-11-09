/** Indian pincodes: six digits, never starting with 0. */
export const PIN_RE = /\b[1-9]\d{5}\b/;

/** The pincode in a place ("Engg.College, Kakinada 533003" -> "533003"), if any. */
export const pinOf = (place?: string): string | undefined => place?.match(PIN_RE)?.[0];

/** A place without its pincode, for matching the town or area by name. */
export const withoutPin = (place?: string) => (place ?? "").replace(new RegExp(PIN_RE.source, "g"), " ").replace(/\s+/g, " ").replace(/[\s,]+$/, "").trim();

/** One post office for a pincode, as returned by /api/pincode/[pin]. */
export type PinPlace = { area: string; city: string; state: string; pincode: string };

/** The post offices (areas) for a pincode, via our cached India Post lookup. */
export async function lookupPincode(pin: string, signal?: AbortSignal): Promise<PinPlace[]> {
  const res = await fetch(`/api/pincode/${pin}/`, { signal }); // the site's addresses end in "/"
  if (!res.ok) throw new Error(res.status === 404 ? "No places found for this pincode." : "Pincode lookup failed. Please try again.");
  const data = (await res.json()) as { places?: PinPlace[] };
  return data.places ?? [];
}
