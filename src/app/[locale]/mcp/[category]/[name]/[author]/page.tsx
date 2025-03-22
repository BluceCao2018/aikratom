import React from 'react';
import { getMCPDataList } from '@/lib/data';
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

type MCPItem = {
  name: string;
  description: string;
  url: string;
  website: string;
  tags: string[];
  status?: string;
};

type PageProps = {
  params: {
    locale: string;
    category: string;
    name: string;
    author: string;
  };
};

export async function generateMetadata({ params }: PageProps) {
  const t = await getTranslations('mcp');
  const w = await getTranslations('website');
  return {
    title: `${params.name} by ${params.author} - ${t('meta_title')}`,
    description: t('meta_description'),
    alternates: {
      canonical: `${w("domain")}/mcp/${params.category}/${params.name}/${params.author}`
    }
  };
}

export default async function MCPToolPage({ params }: PageProps) {
  const { category, name, author } = params;
  const locale = await getLocale();
  const t = await getTranslations('mcp');

  // Get all tools in this category
  const toolsList: MCPItem[] = getMCPDataList(`${category}.jsonc`, locale);
  
  // Find the specific tool by matching the URL pattern
  const expectedUrl = `/mcp/${category}/${name}/${author}`;
  const tool = toolsList.find(item => {
    // Remove leading slash if present
    const itemUrl = item.url.startsWith('/') ? item.url : `/${item.url}`;
    // Add /mcp prefix if not present
    const fullUrl = itemUrl.startsWith('/mcp') ? itemUrl : `/mcp${itemUrl}`;
    return fullUrl === expectedUrl;
  });

  if (!tool) {
    return notFound();
  }

  // Get related tools (same tags, excluding current tool)
  const relatedTools = toolsList
    .filter(item => {
      if (item.url === tool.url) return false;
      return item.tags.some(tag => tool.tags.includes(tag));
    })
    .slice(0, 3);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/" className="hover:underline">
              {t('homeBtn')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/mcp" className="hover:underline">
              {t('mcpBtn')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href={`/mcp/${category}`} className="capitalize hover:underline">
              {category}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{tool.name}</h1>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag, index) => (
                <span key={index} className="px-2.5 py-1 bg-muted rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-lg text-muted-foreground">{tool.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href={tool.website} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
            {tool.website && tool.website !== tool.url && (
              <Button variant="outline" asChild>
                <a href={tool.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>

          {/* Installation & Usage section can be added here */}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2">Author</h3>
            <a 
              href={`https://github.com/${author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
            >
              <Github className="h-4 w-4" />
              <span>{author}</span>
            </a>
          </div>

          {relatedTools.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">Related Tools</h3>
              <div className="space-y-4">
                {relatedTools.map((relatedTool, index) => {
                  // Ensure the URL starts with /mcp
                  const relatedUrl = relatedTool.url.startsWith('/') 
                    ? `/mcp${relatedTool.url}` 
                    : `/mcp/${relatedTool.url}`;
                  
                  return (
                    <Link 
                      key={index}
                      href={relatedUrl}
                      className="block p-3 rounded-md hover:bg-muted"
                    >
                      <h4 className="font-medium">{relatedTool.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedTool.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 