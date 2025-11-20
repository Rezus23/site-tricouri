/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // lasă build-ul să treacă chiar dacă există erori ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;