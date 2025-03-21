import type { MetadataRoute } from "next";

const BASE_URL = 'https://aikratom.com/';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
