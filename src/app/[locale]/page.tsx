import React, { Suspense } from 'react'
import { getSortedPostsData } from '@/lib/posts'
import { getCategories, getDataList } from '@/lib/data'
import { Card } from "@/components/ui/card"
import { ToolsList } from '@/components/ToolsList'
import { ArticleList } from '@/components/ArticleList'
import { InlineSearch } from '@/components/InlineSearch'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'

type Tool = {
  name: string
  description: string
  url: string
  tags?: string[]
  icon_url?: string
  thumb?: string
  website?: string
}

export async function generateMetadata() {
  const t = await getTranslations('home')
  const w = await getTranslations('website')
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    }
  }
}

type categoryType = { 
  name: string
  src: string
  description: string
  link: string 
}

export default async function Home({
  searchParams
}: {
  searchParams?: { q?: string }
}) {
  const locale = await getLocale()
  const t = await getTranslations('home')
  const categories = getCategories(locale)
  const sortedPosts = await getSortedPostsData("article")
  const allPostsData = sortedPosts.slice(0, 6)

  const searchQuery = searchParams?.q
  const allTools = searchQuery 
    ? categories.flatMap((category: categoryType) => getDataList(category.src, locale))
    : []
  
  const searchResults = searchQuery 
    ? allTools.filter((tool: Tool) => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-blue-950/10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B728015_1px,transparent_1px),linear-gradient(to_bottom,#6B728015_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="container mx-auto py-12 space-y-16 relative">
        <section className="relative flex flex-col items-center justify-center text-center space-y-6">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/30 to-indigo-50/20 dark:from-gray-900/40 dark:via-blue-900/20 dark:to-indigo-900/10" />
          </div>
          <h1 className="mx-auto max-w-3xl text-2xl font-bold lg:text-5xl tracking-tighter">
            {t("h1.prefix")}{' '}
            <span className="text-blue-500">{t("h1.highlight")}</span>{' '}
            {t("h1.suffix")}
          </h1>
          <p className="mx-auto max-w-[700px] md:text-xl tracking-tight">
            {t("description")}
          </p>
          <div className='w-full px-2 pt-10 lg:w-1/2'>
            <InlineSearch />
          </div>
        </section>

        {searchQuery ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">
              {t('searchResults', { keyword: searchQuery })}
            </h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold mb-2">{t('noResults', { keyword: searchQuery })}</h2>
                <p className="text-muted-foreground">{t('tryAnotherSearch')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((tool: Tool) => (
                  <Card key={tool.name} className="p-4">
                    <h3 className="font-medium">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {tool.description}
                    </p>
                    {tool.tags && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {tool.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-muted rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2">
                      <Link
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        {t('learnMore')} →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {categories.map((category: categoryType, index: React.Key | null | undefined) => (
              <ToolsList key={index} category={category} locale={locale} />
            ))}
            <div className='border-t'></div>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ArticleList articles={allPostsData} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  )
}