import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // permite build-ul pe Vercel chiar dacă există erori de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;