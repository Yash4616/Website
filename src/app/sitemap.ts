import type { MetadataRoute } from 'next';
import { siteConfig } from '@/data/config';

/** A11 — canonical origin is www.yash.systems, sourced from config. */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.meta.url;
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${baseUrl}/#about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#projects`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    // A3 — per-project permalinks are real indexable pages, so they belong here.
    ...siteConfig.projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
