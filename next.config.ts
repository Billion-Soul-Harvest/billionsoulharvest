import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

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
  async rewrites() {
    return [
      {
        source: "/sw.js",
        destination: "/api/serwist/sw.js",
      },
      {
        source: "/sw.js.map",
        destination: "/api/serwist/sw.js.map",
      },
    ];
  },
};

export default withSerwist(nextConfig);
