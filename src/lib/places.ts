/**
 * Place search and reverse geocoding via Photon (OpenStreetMap data, free, no key).
 * Results are limited to India and biased towards the visitor's location once known.
 */
import { lookupPincode } from "./pincode";

const API = "https://photon.komoot.io";
const INDIA_BBOX = "68.1,6.5,97.4,35.7";
const RECENT_KEY = "gr-recent-places";

/** `area`, `city`, `pincode`: the parts the admin fills in when a place is picked. */
export type Place = { label: string; detail?: string; lat?: number; lon?: number; area?: string; city?: string; pincode?: string };

type Props = {
  name?: string; street?: string; housenumber?: string; locality?: string; district?: string;
  city?: string; county?: string; state?: string; postcode?: string; countrycode?: string;
};
type Feature = { properties: Props; geometry: { coordinates: [number, number] } };

let bias: { lat: number; lon: number } | null = null;

/** "Ward 93 Banjara Hills" → "Banjara Hills". */
const area = (d?: string) => d?.replace(/^ward\s*(no\.?\s*)?\d+\s*[-,]?\s*/i, "") || undefined;

/** A readable address from reverse-geocoded features (nearest first): street, colony, area, city. */
function addressFrom(features: Feature[], cityOnly: boolean): string | null {
  const ps = features.map((f) => f.properties);
  if (!ps.length) return null;
  const first = ps[0];
  const city = first.city || ps.find((p) => p.city)?.city;
  if (cityOnly) return city || area(first.district) || first.county?.replace(/\s*mandal$/i, "") || first.state || null;
  const withStreet = ps.find((p) => p.street);
  const street = withStreet ? [withStreet.housenumber, withStreet.street].filter(Boolean).join(" ") : undefined;
  const locality = first.locality || withStreet?.locality;
  // The pincode goes with the city (or the state), so a pincode search can match it.
  const pin = first.postcode || ps.find((p) => p.postcode)?.postcode;
  const parts = [street, locality, area(first.district || withStreet?.district), city ? [city, pin].filter(Boolean).join(" ") : pin ? `${first.state ?? ""} ${pin}`.trim() : undefined];
  const out = [...new Set(parts.filter((x): x is string => !!x))];
  return out.length ? out.join(", ") : null;
}

/** If the visitor already allowed location, quietly use it to rank nearby suggestions first. */
export async function primeBias() {
  if (bias || typeof navigator === "undefined" || !navigator.permissions) return;
  try {
    const s = await navigator.permissions.query({ name: "geolocation" });
    if (s.state !== "granted") return;
    navigator.geolocation.getCurrentPosition(({ coords }) => { bias = { lat: coords.latitude, lon: coords.longitude }; }, () => {}, { maximumAge: 600000, timeout: 8000 });
  } catch { /* unsupported */ }
}

function toPlace(f: Feature, cityOnly = false): Place {
  const p = f.properties;
  const street = p.street ? [p.housenumber, p.street].filter(Boolean).join(" ") : undefined;
  const district = area(p.district);
  const label = (cityOnly ? p.city || p.name : p.name || street || p.locality || district || p.city) || "Unknown place";
  const parts = cityOnly ? [p.state] : [p.locality, district, p.city, p.state];
  const detail = [...new Set(parts.filter((x): x is string => !!x && x !== label))].join(", ");
  const [lon, lat] = f.geometry.coordinates;
  return { label, detail: detail || undefined, lat, lon, area: cityOnly ? undefined : label, city: p.city, pincode: p.postcode };
}

/** Autocomplete suggestions for a typed query. `city` restricts results to towns and cities. */
export async function searchPlaces(q: string, { city = false, signal }: { city?: boolean; signal?: AbortSignal } = {}): Promise<Place[]> {
  if (/^[1-9]\d{5}$/.test(q.trim())) return pincodePlaces(q.trim(), city, signal);
  const u = new URLSearchParams({ q, limit: "7", lang: "en", bbox: INDIA_BBOX });
  if (city) u.append("osm_tag", "place");
  if (bias) { u.set("lat", String(bias.lat)); u.set("lon", String(bias.lon)); }
  const res = await fetch(`${API}/api/?${u}`, { signal });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = (await res.json()) as { features: Feature[] };
  const seen = new Set<string>();
  return data.features
    .filter((f) => !f.properties.countrycode || f.properties.countrycode === "IN")
    .map((f) => toPlace(f, city))
    .filter((p) => { const k = `${p.label}|${p.detail}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

/** A typed pincode: its areas (post offices), or just its town for a city-only box. */
async function pincodePlaces(pin: string, cityOnly: boolean, signal?: AbortSignal): Promise<Place[]> {
  const offices = await lookupPincode(pin, signal);
  if (cityOnly) {
    const towns = [...new Map(offices.filter((o) => o.city).map((o) => [o.city, o])).values()];
    return towns.map((o) => ({ label: o.city, detail: o.state, city: o.city, pincode: pin }));
  }
  return offices.map((o) => ({ label: o.area, detail: [o.city, `${o.state} ${o.pincode}`.trim()].filter(Boolean).join(", "), area: o.area, city: o.city, pincode: o.pincode }));
}

/** Reads the device location and turns it into a readable address. */
export function currentPlace({ city = false } = {}): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Location isn't available on this device."));
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        bias = { lat: coords.latitude, lon: coords.longitude };
        try {
          const res = await fetch(`${API}/reverse?lat=${coords.latitude}&lon=${coords.longitude}&lang=en&limit=5`);
          const data = (await res.json()) as { features: Feature[] };
          const label = addressFrom(data.features, city);
          if (!label) throw new Error();
          const ps = data.features.map((f) => f.properties);
          const first = ps[0] ?? {};
          resolve({
            label,
            lat: coords.latitude,
            lon: coords.longitude,
            area: first.locality || area(first.district) || first.name,
            city: first.city || ps.find((p) => p.city)?.city,
            pincode: first.postcode || ps.find((p) => p.postcode)?.postcode,
          });
        } catch {
          resolve({ label: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`, lat: coords.latitude, lon: coords.longitude });
        }
      },
      (e) =>
        reject(new Error(e.code === e.PERMISSION_DENIED ? "Location permission is blocked. Allow it in your browser, or type the address." : "Couldn't get your location. Please type the address.")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

export function recentPlaces(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[]; } catch { return []; }
}

export function rememberPlace(label: string) {
  try {
    const list = [label, ...recentPlaces().filter((x) => x !== label)].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch { /* storage unavailable */ }
}
