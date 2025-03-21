import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapRoutes: MetadataRoute.Sitemap = [
    {
      url: '', // home
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
        url: 'tools', // tools
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    {
      url: 'category', // category
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
        url: 'article', // article
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: 'article/privacy-policy', // privacy-policy
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.5,
      },
      {
        url: 'article/terms-of-service', // terms-of-service
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.5,
      },
      {
        url: 'article/about', // about
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: 'mcp', // mcp
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: 'mcp/server', // mcp/server
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },  
      {
        url: 'mcp/client', // mcp/client
        lastModified: new Date(),
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
