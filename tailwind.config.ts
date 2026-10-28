import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: { xs: "360px", sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    extend: {
      colors: {
        brand: { 50: "#FFF2EA", 100: "#FFE0CC", 500: "#F2611D", 600: "#D9500F", 700: "#B4420C" },
        ink: { 900: "#111214", 800: "#1E1F22", 700: "#2B2D31", 600: "#4B4F57", 400: "#8A8F98", 300: "#B7BBC2" },
        surface: { 0: "#FFFFFF", 50: "#F4F5F7", 100: "#E9EBEF" },
        line: "#E2E4E8",
        whatsapp: { DEFAULT: "#25D366", dark: "#1DA851" },
        ok: "#1F9D55",
        err: "#D93025",
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', "sans-serif"],
        head: ["Manrope", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { card: "24px", field: "12px" },
      boxShadow: {
        card: "0 8px 30px rgba(17,18,20,0.06)",
        lift: "0 16px 40px rgba(17,18,20,0.10)",
        float: "0 20px 60px rgba(17,18,20,0.18)",
      },
      maxWidth: { container: "1280px" },
    },
  },
  plugins: [],
};
export default config;
