import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  /* config options here */
=======
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
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
};

export default nextConfig;
