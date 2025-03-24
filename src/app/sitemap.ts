import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapRoutes: MetadataRoute.Sitemap = [
    {
      url: '', // home
      lastModified: new Date('2025-03-24 12:00:00'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
        url: 'tools', // tools
        changeFrequency: 'daily',
        priority: 0.9,
      },
    {
      url: 'category', // category
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
        url: 'article', // article
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: 'article/privacy-policy', // privacy-policy
        changeFrequency: 'daily',
        priority: 0.5,
      },
      {
        url: 'article/terms-of-service', // terms-of-service
        changeFrequency: 'daily',
        priority: 0.5,
      },
      {
        url: 'article/about', // about
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: 'mcp', // mcp
        lastModified: new Date('2025-03-24 12:00:00'),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: 'mcp/server', // mcp/server
        lastModified: new Date('2025-03-24 12:00:00'),
        changeFrequency: 'daily',
        priority: 0.7,
      },  
      {
        url: 'mcp/client', // mcp/client
        lastModified: new Date('2025-03-24 12:00:00'),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: 'cursor', // mcp/client
        lastModified: new Date('2025-03-24 12:00:00'),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: 'cursor/TypeScript', // cursor/server
        lastModified: new Date('2025-03-24 12:00:00'),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      
  ];

  const sitemapData = sitemapRoutes.flatMap((route) => {
    const routeUrl = route.url === '' ? '' : `/${route.url}`;
    return {
        ...route,
        url: `https://aikratom.com${routeUrl}`,
      };
    }
  );

  return sitemapData;
}
