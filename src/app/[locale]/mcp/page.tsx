import React from 'react';
import { getMCPDataList } from '@/lib/data';
import { MCPSearch } from '@/components/MCPSearch';
import StatsCard from '@/components/StatsCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTranslations, getLocale } from 'next-intl/server';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export async function generateMetadata() {
  const t = await getTranslations('mcp');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")+"/mcp"
    }
  };
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

function MCPCard({ item }: { item: MCPItem }) {
  return (
    <div className="group p-6 border-0 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-sm relative">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-xl text-foreground">{item.name}</h3>
        <button className="text-muted-foreground hover:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-3 text-sm">
        <span className="text-muted-foreground">by</span>
        <span className="font-medium text-blue-500 hover:text-blue-600 transition-colors">{item.author}</span>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-xs px-2.5 py-1 bg-blue-50/50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors cursor-pointer">
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
  );
}

function CategorySection({ title, items, viewAllLink }: { title: string; items: MCPItem[]; viewAllLink: string }) {
  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link href={viewAllLink} className="group flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.slice(0, 4).map((item, index) => (
          <Link key={index} href={item.url}>
            <MCPCard item={item} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function MCPHome({ searchParams }: { searchParams: { q?: string } }) {
  const locale = await getLocale();
  const t = await getTranslations('mcp');
  
  const serverData: MCPItem[] = getMCPDataList('server.jsonc', locale);
  const clientData: MCPItem[] = getMCPDataList('client.jsonc', locale);
  
  const keyword = searchParams.q || '';
  
  // Filter function for search
  const filterByKeyword = (items: MCPItem[]) => {
    if (!keyword) return items;
    return items.filter((item: MCPItem) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      item.description.toLowerCase().includes(keyword.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  // Get filtered data
  const filteredServerData = filterByKeyword(serverData.filter((item: MCPItem) => item.status === 'active'));
  const filteredClientData = filterByKeyword(clientData.filter((item: MCPItem) => item.status === 'active'));

  // If there's a search query, show all filtered results
  if (keyword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-blue-950/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B728015_1px,transparent_1px),linear-gradient(to_bottom,#6B728015_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="container mx-auto py-6 space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='capitalize'>{t('mcpBtn')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <section className="relative py-6 overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" />
              <div className="absolute w-full h-full bg-grid-pattern opacity-10" />
            </div>
            
            <div className="container mx-auto px-4">
              <div className="text-center space-y-8">
                <h1 className="text-3xl font-bold tracking-tight capitalize lg:text-5xl pt-10">
                  {t("h1.prefix")}{' '}
                  <span className="text-blue-500">{t("h1.highlight")}</span>{' '}
                  {t("h1.suffix")}
                </h1>
                
                <div className="max-w-2xl mx-auto">
                  <div className="relative group">
                    <MCPSearch category='all' />
                    <div className="absolute inset-0 -z-10 blur-xl group-hover:blur-2xl transition-all bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {(filteredServerData.length > 0 || filteredClientData.length > 0) ? (
            <div className="space-y-16">
              {filteredServerData.length > 0 && (
                <CategorySection 
                  title="Matching MCP Servers" 
                  items={filteredServerData}
                  viewAllLink={`/mcp/server?q=${keyword}`} 
                />
              )}
              
              {filteredClientData.length > 0 && (
                <CategorySection 
                  title="Matching MCP Clients" 
                  items={filteredClientData}
                  viewAllLink={`/mcp/client?q=${keyword}`} 
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default view (no search)
  const featuredServers = serverData.filter((item: MCPItem) => item.status === 'active').slice(0, 4);
  const officialServers = serverData.filter((item: MCPItem) => item.status === 'active' && item.tags?.includes('official')).slice(0, 4);
  const featuredClients = clientData.filter((item: MCPItem) => item.status === 'active').slice(0, 4);
  const latestServers = [...serverData].filter((item: MCPItem) => item.status === 'active').reverse().slice(0, 4);
  const latestClients = [...clientData].filter((item: MCPItem) => item.status === 'active').reverse().slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-blue-950/10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B728015_1px,transparent_1px),linear-gradient(to_bottom,#6B728015_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="container mx-auto py-5 space-y-0 relative">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='capitalize'>{t('mcpBtn')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <section className="relative py-5 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/30 to-indigo-50/20 dark:from-gray-900/40 dark:via-blue-900/20 dark:to-indigo-900/10" />
          </div>
          
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8">
              <h1 className="text-3xl font-bold tracking-tight capitalize lg:text-5xl pt-10">
                {t("h1.prefix")}{' '}
                <span className="text-blue-500">{t("h1.highlight")}</span>{' '}
                {t("h1.suffix")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto" 
                 dangerouslySetInnerHTML={{ __html: t("description") }}>
              </p>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <MCPSearch category='all' />
                  <div className="absolute inset-0 -z-10 blur-xl group-hover:blur-2xl transition-all bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full" />
                </div>
              </div>

              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <StatsCard title="Servers" value={serverData.length.toString() + "+"} />
                <StatsCard title="Clients" value={clientData.length.toString() + "+"} />
                <StatsCard title="Categories" value="10+" />
                <StatsCard title="Tools" value="50+" />
              </div> */}
            </div>
          </div>
        </section>

        <div className="space-y-16 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/80 to-white/90 dark:from-transparent dark:via-gray-950/80 dark:to-gray-950/90" />
          <CategorySection 
            title="Featured MCP Servers" 
            items={featuredServers}
            viewAllLink="/mcp/server?filter=featured" 
          />
          
          <CategorySection 
            title="Official MCP Servers" 
            items={officialServers}
            viewAllLink="/mcp/server?filter=official" 
          />
          
          <CategorySection 
            title="Featured MCP Clients" 
            items={featuredClients}
            viewAllLink="/mcp/client?filter=featured" 
          />
          
          <CategorySection 
            title="Latest MCP Servers" 
            items={latestServers}
            viewAllLink="/mcp/server?filter=latest" 
          />
          
          <CategorySection 
            title="Latest MCP Clients" 
            items={latestClients}
            viewAllLink="/mcp/client?filter=latest" 
          />
        </div>

        <section className="py-24 space-y-12">
          <h2 className="text-3xl font-bold tracking-tight text-center">FAQ</h2>
          <p className="text-muted-foreground text-center">Frequently Asked Questions about MCP Servers & Clients</p>
          <div className="grid gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">What is Model Context Protocol?</h3>
              <p className="text-muted-foreground">
                Model Context Protocol (MCP) is a standardized communication protocol that enables AI models to interact with external tools and services. It provides a secure and efficient way for AI assistants to access and manipulate data, making them more capable and versatile.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">How can I create an MCP Server?</h3>
              <p className="text-muted-foreground">
                Creating an MCP server involves implementing the protocol specification and exposing your tools or services through standardized endpoints. You can start by using our SDK and following the documentation to build servers that provide specific functionalities to AI models.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">What types of tools can I build?</h3>
              <p className="text-muted-foreground">
                You can build a wide range of tools, from simple utilities to complex integrations. Common examples include file operations, API wrappers, database connectors, code analysis tools, and specialized domain-specific tools for tasks like image processing or data analysis.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Is MCP suitable for enterprise use?</h3>
              <p className="text-muted-foreground">
                Yes, MCP is designed with enterprise requirements in mind. It includes features for security, access control, and scalability. Organizations can create private MCP servers to expose internal tools and services to AI models while maintaining full control over their data and resources.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">How does versioning work in MCP?</h3>
              <p className="text-muted-foreground">
                MCP uses semantic versioning to manage compatibility between servers and clients. Each server can specify supported versions, and clients can negotiate the appropriate version to use. This ensures smooth upgrades and backwards compatibility when needed.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">What about security and privacy?</h3>
              <p className="text-muted-foreground">
                Security is a core principle of MCP. The protocol includes built-in authentication, authorization, and encryption features. Servers can implement fine-grained access controls, and all communication is secured using industry-standard protocols.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 