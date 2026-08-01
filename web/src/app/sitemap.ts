import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.PUBLIC_APP_URL || "https://web-gamma-sand-66.vercel.app";

  const paths = [
    "",
    "/product",
    "/pricing",
    "/docs",
    "/faq",
    "/start",
    "/login",
    "/dashboard",
    "/privacy",
    "/terms",
  ];

  return paths.map((path, i) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : i < 4 ? 0.8 : 0.5,
  }));
}
