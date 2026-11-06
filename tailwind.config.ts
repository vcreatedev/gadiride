import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: { xs: "360px", sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    extend: {
      colors: {
        brand: { 50: "#FFF5E9", 100: "#FFE6C7", 200: "#FFCF8F", 300: "#FDB44F", 400: "#FA9A2A", 500: "#F47A16", 600: "#E35E0B", 700: "#B9470A", 800: "#8E370B" },
        taxi: { DEFAULT: "#FFC20E", 50: "#FFF8DB", 600: "#E5A800" },
        ink: { 900: "#16161A", 800: "#212126", 700: "#2E2E34", 600: "#4D4D55", 400: "#8B8B94", 300: "#BABAC2" },
        surface: { 0: "#FFFFFF", 50: "#F4F5F7", 100: "#E9EBEF" },
        line: "#E2E4E8",
        whatsapp: { DEFAULT: "#25D366", dark: "#1DA851" },
        ok: "#1F9D55",
        err: "#D93025",
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', "sans-serif"],
        head: ["Fredoka", "Inter", "system-ui", "sans-serif"],
        brand: ["Fredoka", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { card: "24px", field: "12px" },
      boxShadow: {
        card: "0 8px 30px rgba(22,22,26,0.06)",
        lift: "0 16px 40px rgba(22,22,26,0.10)",
        float: "0 20px 60px rgba(22,22,26,0.18)",
      },
      maxWidth: { container: "1280px" },
      backgroundImage: {
        "brand-gradient": "linear-gradient(100deg, #FDB022 0%, #F47A16 55%, #E8540C 100%)",
        "brand-gradient-hover": "linear-gradient(100deg, #F9A512 0%, #E8650C 55%, #D44A08 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
