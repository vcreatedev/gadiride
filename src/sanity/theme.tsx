"use client";
import { buildLegacyTheme, type NavbarProps } from "sanity";

/** Admin (Sanity Studio) in the website's colours: logo orange on the site's dark ink. */
const BRAND = {
  orange: "#F47A16",
  yellow: "#FFC20E",
  ink: "#16161A",
  gray: "#8B8B94",
  white: "#FFFFFF",
  ok: "#1F9D55",
  err: "#D93025",
};

export const studioTheme = buildLegacyTheme({
  "--black": BRAND.ink,
  "--white": BRAND.white,
  "--gray": BRAND.gray,
  "--gray-base": BRAND.gray,
  "--component-bg": BRAND.white,
  "--component-text-color": BRAND.ink,
  "--brand-primary": BRAND.orange,
  "--default-button-color": BRAND.gray,
  "--default-button-primary-color": BRAND.orange,
  "--default-button-success-color": BRAND.ok,
  "--default-button-warning-color": BRAND.yellow,
  "--default-button-danger-color": BRAND.err,
  "--state-info-color": BRAND.orange,
  "--state-success-color": BRAND.ok,
  "--state-warning-color": BRAND.yellow,
  "--state-danger-color": BRAND.err,
  "--main-navigation-color": BRAND.ink,
  "--main-navigation-color--inverted": BRAND.white,
  "--focus-color": BRAND.orange,
  "--font-family-base": 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  "--font-family-monospace": '"IBM Plex Mono", ui-monospace, monospace',
});

/** The Gadiride location pin, used as the workspace icon in the admin. */
export function GadirideIcon() {
  return (
    <svg viewBox="0 0 24 34" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="studio-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FA9A2A" />
          <stop offset="1" stopColor="#E8540C" />
        </linearGradient>
      </defs>
      <path d="M12 1C6 1 1.5 5.4 1.5 11.2 1.5 18.6 12 27 12 27s10.5-8.4 10.5-15.8C22.5 5.4 18 1 12 1Z" fill="url(#studio-pin)" />
      <circle cx="12" cy="11" r="4.2" fill="#fff" />
      <circle cx="12" cy="31" r="2.6" fill="#16161A" />
    </svg>
  );
}

/** Default navbar with the brand gradient strip on top and a reminder of which data is being edited. */
export function makeNavbar(label: string, live: boolean) {
  return function BrandNavbar(props: NavbarProps) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "6px 14px",
            background: "linear-gradient(100deg, #FDB022 0%, #F47A16 55%, #E8540C 100%)",
            color: "#fff",
            font: "600 12px/1.2 Fredoka, Inter, system-ui, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          <span>Gadiride admin</span>
          <span
            style={{
              borderRadius: 999,
              padding: "2px 10px",
              background: live ? "#16161A" : "rgba(255,255,255,0.25)",
              color: live ? "#FFC20E" : "#fff",
            }}
          >
            {label}
          </span>
        </div>
        {props.renderDefault(props)}
      </div>
    );
  };
}
