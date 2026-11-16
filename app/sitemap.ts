import type { MetadataRoute } from "next";
import { instruments, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    ...instruments.map((i) => ({
      url: `${site.url}/work/${i.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
