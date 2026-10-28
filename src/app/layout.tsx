import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/SmoothScroll";
import QuoteFlow from "@/components/QuoteFlow";
import WhatsAppFab from "@/components/WhatsAppFab";

export const metadata: Metadata = {
  title: { default: "Gadiride | Cars, buses, trucks and JCBs on rent", template: "%s | Gadiride" },
  description: "Rent cars, tempo travellers, buses, trucks and backhoe loaders (JCB) from one place. Share your details and get a quote on WhatsApp.",
  openGraph: {
    title: "Gadiride: every vehicle, one ride",
    description: "Cars, passenger vehicles, logistics vehicles and heavy equipment on rent. Get a quote on WhatsApp.",
    type: "website",
    locale: "en_IN",
    siteName: "Gadiride",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#111214" };

const seenScript = `try{if(sessionStorage.getItem('ga_loader_seen'))document.documentElement.classList.add('ga-seen')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: seenScript }} />
        <noscript><style>{`#ga-loader{display:none}`}</style></noscript>
      </head>
      <body>
        <QuoteFlow>
          <Loader />
          <SmoothScroll />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFab />
        </QuoteFlow>
      </body>
    </html>
  );
}
