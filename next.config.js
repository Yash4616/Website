/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds for security
  },
  images: { 
    unoptimized: true, // Disable image optimization for static export
    domains: ['images.pexels.com'], // Allow optimization for external domain
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Define device size breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Define image size breakpoints
  },
  // Add compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable gzip compression for static exports
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Security headers configuration
  // Note: For static export (output: 'export'), headers must be configured
  // at the hosting platform level (Vercel, Netlify, etc.)
  // These headers are included here for reference and will work with 'next start'
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.pexels.com; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-ancestors 'self';"
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
