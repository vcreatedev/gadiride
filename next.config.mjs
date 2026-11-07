/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server build so content published in Sanity appears without a redeploy
  // (cached for 60s, or instantly via /api/revalidate).
  images: {
    // Local photos in /public are resized and converted to AVIF/WebP by Next.
    // Sanity photos use Sanity's own CDN (see components/Photo.tsx).
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [40, 96, 200, 260, 380],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "gsap"],
  },
  // The admin moved from /studio to /admin; old bookmarks keep working.
  async redirects() {
    return [
      { source: "/studio/:path*", destination: "/admin/:path*", permanent: true },
      // One admin per site now; the old per-dataset addresses lead to it.
      { source: "/admin/:ws(production|development)/:path*", destination: "/admin/:path*", permanent: false },
      { source: "/admin/:ws(production|development)", destination: "/admin", permanent: false },
    ];
  },
  async headers() {
    // Only gadiride.com (production data) may appear in search results; dev.gadiride.com and previews may not.
    const noindex = process.env.NEXT_PUBLIC_SANITY_DATASET !== "production"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
      : [];
    return [
      ...noindex,
      {
        source: "/:dir(vehicles|brand)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};
export default nextConfig;
