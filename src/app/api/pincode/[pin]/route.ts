import { NextResponse } from "next/server";
import { cityOption } from "@/lib/serviceArea";
import type { PinPlace } from "@/lib/pincode";

/**
 * Areas (post offices) for an Indian pincode, from India Post's public lookup. Used by the
 * location boxes on the website and in the admin. Answers are cached for a day.
 */
const SOURCE = "https://api.postalpincode.in/pincode";
const TIMEOUT_MS = 8_000;
const ONE_DAY = 86_400;

type PostOffice = { Name?: string; Block?: string; Division?: string; District?: string; State?: string; Pincode?: string };

/** Our city for a post office: its block, division or district, whichever is one of our Location choices. */
function cityOf(po: PostOffice): string {
  const tries = [po.Block, po.Division, po.District].map((x) => (x ?? "").replace(/\(.*?\)/g, "").trim());
  return tries.map((t) => cityOption(t)).find(Boolean) ?? tries.find(Boolean) ?? "";
}

export async function GET(_req: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  if (!/^[1-9]\d{5}$/.test(pin)) return NextResponse.json({ error: "A pincode has 6 digits." }, { status: 400 });
  try {
    const res = await fetch(`${SOURCE}/${pin}`, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: ONE_DAY } });
    if (!res.ok) throw new Error(`India Post answered ${res.status}`);
    const data = (await res.json()) as { Status?: string; PostOffice?: PostOffice[] | null }[];
    const offices = data[0]?.Status === "Success" ? data[0].PostOffice ?? [] : [];
    if (!offices.length) return NextResponse.json({ places: [] }, { status: 404 });
    const places: PinPlace[] = offices
      .filter((po) => po.Name)
      // "Sriramnagar (Kakinada)" -> "Sriramnagar": the town is in `city`.
      .map((po) => ({ area: (po.Name as string).replace(/\s*\(.*?\)\s*/g, " ").trim(), city: cityOf(po), state: po.State ?? "", pincode: po.Pincode ?? pin }));
    return NextResponse.json({ places }, { headers: { "Cache-Control": `public, s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY}` } });
  } catch (err) {
    console.error("pincode lookup failed", pin, err);
    return NextResponse.json({ error: "Pincode lookup is not available right now." }, { status: 502 });
  }
}
