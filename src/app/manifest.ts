import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetReSet — Movement Coach",
    short_name: "LetReSet",
    description:
      "Short routines for how your body and head actually feel through the workday.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#eef0ea",
    theme_color: "#4b6858",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
