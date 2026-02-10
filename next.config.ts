import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Generic pattern for Supabase storage
      },
      {
        protocol: 'https',
        hostname: 'jlnwyusqbrcztffmjzmv.supabase.co', // Specific pattern just in case
      },
    ],
  },
};

export default nextConfig;
