import { MetadataRoute } from 'next';
import { MOCK_EXPERIENCES } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://momanature.com'; // Replace with actual domain

  const experiences = MOCK_EXPERIENCES.map((experience) => ({
    url: `${baseUrl}/experiencias/${experience.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const routes = [
    '',
    '/experiencias',
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }));

  return [...routes, ...experiences];
}
