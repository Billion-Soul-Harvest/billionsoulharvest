import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN,
  },
};

export default nextConfig;
