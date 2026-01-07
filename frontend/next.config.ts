import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Gzip/Brotli compression
  compress: true,
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Allow external images
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Serve static files from /app/uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
