import React from 'react';
import { getMCPDataList, getMCPByLink } from '@/lib/data';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { MCPSearch } from '@/components/MCPSearch';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { category: string } }) {
  const t = await getTranslations('mcp');
  const w = await getTranslations('website');
  return {
    title: `${t('meta_title')} - ${params.category.toUpperCase()}`,
    description: t('meta_description'),
    alternates: {
      canonical: w("domain") + "/mcp/" + params.category
    }
  }
}

type MCPItem = {
  name: string;
  description: string;
  url: string;
  website: string;
  tags: string[];
  status?: string;
  author: string;
};

function MCPGrid({ items }: { items: MCPItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <Link key={index} href={item.url} className="block">
          <div className="group p-6 rounded-xl hover:shadow-lg transition-all duration-200 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm relative">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-xl text-foreground">{item.name}</h3>
              <button className="text-muted-foreground hover:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <span>by</span>
              <span className="font-medium text-blue-500 hover:text-blue-600 transition-colors">{item.author}</span>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs px-2.5 py-1 bg-secondary rounded-full text-secondary-foreground hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

const CATEGORIES = {
  server: [
    { id: 'all', label: 'All' },
    { id: 'development', label: 'Development Tools' },
    { id: 'database', label: 'Database & Storage' },
    { id: 'ai', label: 'AI & Machine Learning' },
    { id: 'browser', label: 'Browser & Web' },
    { id: 'integration', label: 'Integration & API' },
    { id: 'system', label: 'System & Infrastructure' }
  ],
  client: [
    { id: 'all', label: 'All' },
    { id: 'ide', label: 'IDE & Editors' },
    { id: 'cli', label: 'CLI Tools' },
    { id: 'gui', label: 'GUI Applications' },
    { id: 'browser', label: 'Browser Extensions' },
    { id: 'mobile', label: 'Mobile Apps' },
    { id: 'sdk', label: 'SDK & Libraries' }
  ]
};

type PageProps = {
  params: { category: string };
  searchParams: { q?: string; filter?: string };
};

const MCPCategory = async ({ params, searchParams }: PageProps) => {
  const category = params.category;
  const keyword = searchParams.q || '';
  const currentFilter = searchParams.filter || 'all';
  const locale = await getLocale();
  const t = await getTranslations('mcp');

  const categoryInfo = getMCPByLink(category, locale);
  if (!categoryInfo || !['server', 'client'].includes(category)) {
    return notFound();
  }

  const allData = getMCPDataList(categoryInfo.src, locale);
  
  // Filter active items
  let filteredData = allData.filter((item: MCPItem) => item.status === "active");
  
  // Apply keyword search if present
  if (keyword) {
    filteredData = filteredData.filter((item: MCPItem) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) || 
      item.description.toLowerCase().includes(keyword.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  }
  
  // Apply category filter if not 'all'
  if (currentFilter !== 'all') {
    filteredData = filteredData.filter((item: MCPItem) => {
      const itemTags = item.tags.map(tag => tag.toLowerCase());
      switch (currentFilter) {
        case 'development':
          return itemTags.some(tag => ['development', 'tools', 'ide'].includes(tag));
        case 'database':
          return itemTags.some(tag => ['database', 'storage', 'redis', 'postgresql'].includes(tag));
        case 'ai':
          return itemTags.some(tag => ['ai', 'machine-learning', 'llm'].includes(tag));
        case 'browser':
          return itemTags.some(tag => ['browser', 'web', 'chrome'].includes(tag));
        case 'integration':
          return itemTags.some(tag => ['integration', 'api', 'sdk'].includes(tag));
        case 'system':
          return itemTags.some(tag => ['system', 'infrastructure', 'docker'].includes(tag));
        case 'ide':
          return itemTags.some(tag => ['ide', 'editor', 'vscode'].includes(tag));
        case 'cli':
          return itemTags.some(tag => ['cli', 'terminal', 'command-line'].includes(tag));
        case 'gui':
          return itemTags.some(tag => ['gui', 'desktop', 'application'].includes(tag));
        case 'mobile':
          return itemTags.some(tag => ['mobile', 'ios', 'android'].includes(tag));
        case 'sdk':
          return itemTags.some(tag => ['sdk', 'library', 'framework'].includes(tag));
        default:
          return true;
      }
    });
  }

  const categories = CATEGORIES[category as keyof typeof CATEGORIES];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-slate-50/50 dark:from-blue-950/10 dark:to-slate-950/10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B728015_1px,transparent_1px),linear-gradient(to_bottom,#6B728015_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="container mx-auto py-12 relative">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/mcp">{t('mcpBtn')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='capitalize'>{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col justify-between items-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight capitalize lg:text-5xl pt-10" 
              dangerouslySetInnerHTML={{ __html: categoryInfo.h1 }} />
          <p className="text-md mt-2 opacity-60 lg:text-xl" 
             dangerouslySetInnerHTML={{ __html: categoryInfo.h1description }} />
        </div>

        <div className="mb-8">
          <MCPSearch category={category} />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/mcp/${category}?filter=${cat.id}${keyword ? `&q=${keyword}` : ''}`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                currentFilter === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <MCPGrid items={filteredData} />

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCPCategory;