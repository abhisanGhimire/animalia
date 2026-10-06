import type { MetadataRoute } from "next";

export const dynamic = "force-static";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Animalia: Explore Every Animal",
    short_name: "Animalia",
    description: "A kid-friendly animal encyclopedia with food webs, a tree of life and quizzes.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#fff8e6",
    theme_color: "#d9480f",
    icons: [
      { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${base}/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
