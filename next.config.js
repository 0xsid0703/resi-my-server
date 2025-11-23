/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable trailing slash redirects
  trailingSlash: false,
  // Ensure we don't have automatic redirects
  async redirects() {
    return [];
  },
}

module.exports = nextConfig

