/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Vercel deployment with hybrid setup
  output: 'standalone',
  
  // Configure CORS headers for API routes
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

  // Rewrites to serve Vite-built frontend from /dist
  async rewrites() {
    return [
      {
        source: '/app/:path*',
        destination: '/dist/:path*',
      },
    ]
  },
}

module.exports = nextConfig