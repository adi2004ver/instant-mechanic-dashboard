import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // This securely proxies requests from Vercel to your HTTP AWS server
    // bypassing the browser's Mixed Content security blocks!
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiUrl}/socket.io/:path*`,
      }
    ];
  },
};

export default nextConfig;
