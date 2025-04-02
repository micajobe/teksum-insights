/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  transpilePackages: ['cheerio'],
  experimental: {
    serverActions: true
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/api/reports/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/docs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 