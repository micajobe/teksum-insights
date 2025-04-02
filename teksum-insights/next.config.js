/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
    outputFileTracingIncludes: {
      '/docs/**/*': ['./docs/**/*'],
    },
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/api/reports/:path*',
      },
      {
        source: '/test',
        destination: '/test',
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
      {
        source: '/test',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 