import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for server-side features
  images: {
    domains: ['hxaurxmxrsobqgctrihc.supabase.co'],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;