import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo-name>, so the build sets NEXT_PUBLIC_BASE_PATH.
// Locally (npm run dev) it is empty and the site lives at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // build plain HTML/JS files: no server needed
  basePath,
  trailingSlash: true, // /tree/ -> tree/index.html, which GitHub Pages serves correctly
  images: { unoptimized: true },
};

export default nextConfig;
