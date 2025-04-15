/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      // Add any other domains you need to load images from here
    ],
  },
  env: {
    // Frontend environment variables
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  // Enable experimental features if needed
  experimental: {
    // appDir: true, // Already using App Router based on package.json
  },
};

module.exports = nextConfig;
