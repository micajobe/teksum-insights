/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add transpilePackages to handle undici
  transpilePackages: ['undici', 'cheerio'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    
    return config;
  },
  // Disable font optimization
  optimizeFonts: false,
  // Remove experimental options that were causing issues
  experimental: {
    // Add only supported experimental features here if needed
  },
  // Ensure public directory is included in the build
  output: 'standalone',
  // Copy the reports directory to the build output
  async rewrites() {
    return [
      {
        source: '/reports/:path*',
        destination: '/reports/:path*',
      },
    ];
  },
  // Copy the reports directory to the build output
  async headers() {
    return [
      {
        source: '/reports/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 