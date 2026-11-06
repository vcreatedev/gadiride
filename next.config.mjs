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
  // The home page is hidden for now: the site opens on the Cars page.
  async headers() {
    return [
      {
        source: "/:dir(vehicles|brand)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};
export default nextConfig;
