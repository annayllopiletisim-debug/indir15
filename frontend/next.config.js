/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for production
  output: 'standalone',
  
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
  
  // Server external packages - critical for mongoose to work
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],
  
  // Webpack configuration for external packages
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'mongoose', 'bcryptjs', 'jsonwebtoken'];
    }
    return config;
  },
  
  // Experimental settings
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
