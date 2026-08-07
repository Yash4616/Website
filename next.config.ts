import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

/**
 * Replaces next.config.js + next.config.analyzer.js (A8).
 *
 * NOTE (A2): there is deliberately no `experimental.ppr`. Partial Prerendering
 * is Next-canary-only and requires React 19; this project ships Next 15.5.15
 * stable on React 18.2. Every other §9.4 delivery optimization still applies.
 */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },

  // §9.1 item 1 — barrel imports. `import { Brain } from "lucide-react"` can pull
  // hundreds of modules into the graph without this.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      'react-icons',
    ],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,

  // Security headers configuration
  // Note: For static export (output: 'export'), headers must be configured
  // at the hosting platform level (Vercel, Netlify, etc.)
  // These headers are included here for reference and will work with 'next start'
  //
  // ⚠ ONE KNOWN AMENDMENT IS STILL DUE HERE:
  //   Stage 7: the Resend contact route needs Resend's API host in `connect-src`.
  //
  // A26 — `worker-src 'self' blob:` is already in place, added ahead of the
  // OffscreenCanvas migration (§9.2) deliberately: with the policy landed first,
  // a CSP rejection can never be mistaken for a renderer bug while debugging the
  // worker. The block is otherwise preserved verbatim from next.config.js.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.pexels.com; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; worker-src 'self' blob:; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

// §9.5 — `ANALYZE=true npm run build` opens the treemap. Off by default.
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
