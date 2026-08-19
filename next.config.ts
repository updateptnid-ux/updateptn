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

  // Fix HTTP 431: Request Header Fields Too Large
  // Supabase JWT cookies can be very large — increase Node.js HTTP header limit
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "172.20.10.5:3000",  // network IP (mobile hotspot / local network)
        "0.0.0.0:3000",
      ],
    },
  },
  
  // allowedDevOrigins: allow localhost variants to call the dev server
  // Fixes "Failed to fetch" / stale Turbopack Server Action errors in dev
  // If allowedDevOrigins is unrecognized, we can remove it, but let's try it here.
};

export default nextConfig;
