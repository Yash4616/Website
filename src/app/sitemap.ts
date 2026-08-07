import type { MetadataRoute } from 'next';
import { siteConfig } from '@/data/config';
import { getNotes } from '@/lib/notes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notes = await getNotes();
  const updated = new Date();
  return [
    { url: siteConfig.meta.url, lastModified: updated, changeFrequency: 'monthly', priority: 1 },
    ...siteConfig.projects.map((project) => ({ url: `${siteConfig.meta.url}/projects/${project.id}`, lastModified: updated, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${siteConfig.meta.url}/notes`, lastModified: updated, changeFrequency: 'monthly', priority: 0.6 },
    ...notes.filter((note) => note.status === 'published').map((note) => ({ url: `${siteConfig.meta.url}/notes/${note.slug}`, lastModified: new Date(note.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
