import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN,
  },
  images: {
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
    ],
  },
};

export default nextConfig;
