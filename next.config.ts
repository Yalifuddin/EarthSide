import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Lets phones/laptops on the same Wi-Fi open the dev server via its Network URL
  // (e.g. http://192.168.x.x:3000). Without this, Next blocks the dev scripts and
  // the page never becomes interactive. Development only; ignored in production.
  // Note: those are plain-http pages, so browser APIs that need https (clipboard,
  // randomUUID) have fallbacks in the code.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  images: {
    // Hosts that article cover images may be uploaded to.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.firebasestorage.app" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
