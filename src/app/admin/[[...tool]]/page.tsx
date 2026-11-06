import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { sanityEnabled } from "@/sanity/env";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-900 p-6 text-white">
        <div className="max-w-lg">
          <h1 className="font-head text-3xl font-semibold text-white">Admin not connected yet</h1>
          <p className="mt-3 text-ink-300">
            Set <code className="text-brand-300">NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and optionally{" "}
            <code className="text-brand-300">NEXT_PUBLIC_SANITY_DATASET</code>) in <code>.env.local</code> or in your Vercel
            project settings, then restart. See README, section &quot;Admin (Sanity)&quot;.
          </p>
        </div>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
