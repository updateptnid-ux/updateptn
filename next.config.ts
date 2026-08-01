import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Clearbit as optional external fallback for logos not in local assets
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
    // Optimize local logo images: cache aggressively, serve modern formats
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
