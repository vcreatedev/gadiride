import type { MetadataRoute } from "next";

/** /manifest.webmanifest: name, colours and icons for "Add to home screen" and search results. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gadiride: cars, buses, trucks and JCBs on rent",
    short_name: "Gadiride",
    description: "Self drive and chauffeur cars, tempo travellers, buses, trucks and JCBs on rent in Hyderabad. Get a quote on WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#F47A16",
    lang: "en-IN",
    categories: ["travel", "transportation", "business"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
