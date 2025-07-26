/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
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
};

module.exports = nextConfig;
