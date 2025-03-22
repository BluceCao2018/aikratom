import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Star, Download, Server, Globe, FileJson, Database, Terminal } from 'lucide-react'
import { getMCPCategories, getMCPDataList } from '@/lib/data'
import { getTranslations, getLocale } from 'next-intl/server'
import { MCPSearch } from '@/components/MCPSearch'
import StatsCard from '@/components/StatsCard'
import { GetServerSideProps } from 'next'

type Category = {
  name: string;
  src: string;
  description: string;
  link: string;
}

type MCPListProps = {
  category: {
    name: string
    src: string
    description: string
    link: string
  }
  mcpList: any[] // 从父组件接收数据
  locale: string
}

// Define the props interface for MCPListPage
type MCPListPageProps = {
  category: string;
  locale: string;
  searchResults: any[];
}

// Define a type for the items in allData
type MCPItem = {
  name: string;
  description: string;
  // Add other properties if needed
};

export async function generateMetadata() {
  const t = await getTranslations('mcp')
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  }
}

// Update MCPListPage to use the defined props
const MCPListPage = ({ category, locale, searchResults }: MCPListPageProps) => {
  const t =  getTranslations('mcp')
  const mcpCategories = getMCPCategories(locale)

  return (
    <div className="container mx-auto py-6 space-y-16">
      <section className="relative py-0 overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="relative group">
            <MCPSearch category={category} />
            <div className="absolute inset-0 -z-10 blur-xl group-hover:blur-2xl transition-all bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full" />
          </div>
        </div>
      </section>
      
      <MCPList 
        category={{ name: category, src: '', description: '', link: '' }} 
        mcpList={searchResults}
        locale={locale} 
      />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context
  const category = query.category as string || 'default'
  const keyword = query.q as string || ''
  const locale = 'en' // 你可以根据需要获取 locale

  const allData = getMCPDataList(category, locale)
  const searchResults = allData.filter((item: MCPItem) =>
    item.name.includes(keyword) || item.description.includes(keyword)
  )

  return {
    props: {
      category,
      locale,
      searchResults,
    },
  }
}

const MCPList = ({ category, mcpList, locale }: MCPListProps) => {
  const t = useTranslations('mcp')

  const IconComponent = ({ name }: { name: string }) => {
    const icons = {
      server: <Server />,
      web: <Globe />,
      file: <FileJson />,
      database: <Database />,
      default: <Terminal />
    }
    return icons[name as keyof typeof icons] || icons.default
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between group">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {category.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        </div>
        <Link
          href={`/mcp/${category.link}`}
          className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
        >
          {t('viewAll')}
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mcpList.map((mcp: any) => (
          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <IconComponent name={mcp.type} />
              </div>

              <div>
                <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {mcp.name}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {mcp.description}
                </p>
              </div>

              {mcp.tags && (
                <div className="flex flex-wrap gap-2">
                  {mcp.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Link
                  href={mcp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {t('learnMore')} 
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {mcp.stars}
                  </span>
                  <span className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {mcp.downloads}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
} 

export default MCPListPage