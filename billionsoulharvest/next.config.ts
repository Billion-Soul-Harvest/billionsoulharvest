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
    ],
  },
};

export default nextConfig;
