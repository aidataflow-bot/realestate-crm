/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only build API routes, not pages
  experimental: {
    outputFileTracing: false,
  },
  // Disable static optimization for API routes
  target: 'serverless',
  // Configure for Vercel deployment
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig