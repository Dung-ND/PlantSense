import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Uploaded product photos are served from /media and optimised by next/image.
  images: { localPatterns: [{ pathname: "/media/**" }] },
  // Native module: load from node_modules at runtime instead of bundling.
  serverExternalPackages: ["better-sqlite3", "sharp"],
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
