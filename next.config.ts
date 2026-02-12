import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // serverActions: true, // Not supported in export
  },
  // Ensure trailing slashes for folder-based routing on Apache/cPanel
  trailingSlash: true,

  /* 
  // Rewrites are not supported with output: 'export'
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://momaexcursiones.co/api/:path*',
      },
    ];
  },
  */

};

export default nextConfig;
