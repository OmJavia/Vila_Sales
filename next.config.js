/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode to prevent double-mount in dev (re-enable in prod builds)
  reactStrictMode: false,
  images: {
    remotePatterns: [],
  },
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Faster local development
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
};

module.exports = nextConfig;
