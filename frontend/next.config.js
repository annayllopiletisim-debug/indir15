/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
