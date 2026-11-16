import type { NextConfig } from "next";

// Sent with every response. There is no Content-Security-Policy here: the
// pages are static and carry inline scripts (the view switch, the data React
// hydrates from), so a strict policy would need a nonce and a render per request.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // The stylesheet goes into the document instead of a second, render-
    // blocking request. Measured on a cold load at 4x CPU and slow 4G, first
    // paint came about 18% sooner in the Brief and 32% sooner in the Field;
    // with the stylesheet left external it did not move. The cost is about
    // 13 KB more per document, which the later milestones did not notice.
    inlineCss: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // WEAR became part of the Kaggle Competitions project.
      { source: "/work/wear", destination: "/work/kaggle", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
