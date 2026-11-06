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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  ),
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
        <noscript><style>{`#ga-loader{display:none}.invisible{visibility:visible!important}`}</style></noscript>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
