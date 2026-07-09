import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
