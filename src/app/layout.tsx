import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { SITE_URL } from "@/lib/siteUrl";
import StaleBuildGuard from "@/components/StaleBuildGuard";

/** Search Console ownership tags, set in Vercel when the site is added to Google / Bing Webmaster Tools. */
const verification = {
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
};

export const metadata: Metadata = {
  // Every absolute link (share images, canonical addresses) uses gadiride.com.
  metadataBase: new URL(SITE_URL),
  applicationName: "Gadiride",
  publisher: "Gadiride",
  category: "travel",
  formatDetection: { telephone: true, email: true, address: true },
  verification,
  title: { default: "Gadiride | Cars, buses, trucks and JCBs on rent", template: "%s | Gadiride" },
  description: "Rent cars, tempo travellers, buses, trucks and backhoe loaders (JCB) from one place. Share your details and get a quote on WhatsApp.",
  openGraph: {
    title: "Gadiride: every vehicle, one ride",
    description: "Cars, passenger vehicles, logistics vehicles and heavy equipment on rent. Get a quote on WhatsApp.",
    type: "website",
    locale: "en_IN",
    siteName: "Gadiride",
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "Gadiride" }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#F47A16" };


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Start connecting to the photo server early, so hero and vehicle photos arrive sooner. */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <noscript><style>{`#ga-loader{display:none}.invisible{visibility:visible!important}`}</style></noscript>
      </head>
      <body>
        <StaleBuildGuard />
        {children}
      </body>
    </html>
  );
}
