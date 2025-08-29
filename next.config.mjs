/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated appDir setting (it's now default in Next.js 14)
  // Add production optimizations
  output: 'standalone', // Enables standalone output for better containerization
  experimental: {
    // Remove appDir as it's no longer experimental
  },
}

export default nextConfig
