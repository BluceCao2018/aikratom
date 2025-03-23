// 'use client'
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Star, Download, MousePointer, Code, Terminal, ExternalLink } from 'lucide-react'
import { getCursorCategories, getCursorDataList, getDataList } from '@/lib/data'
import { getTranslations, getLocale } from 'next-intl/server'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge";

type CursorListProps = {
  category: {
    name: string
    src: string
    description: string
    link: string
  }
  cursorList: any[]
  locale: string
}

// Define the props interface for CursorListPage
interface CursorListPageProps {
  category: any;
  locale: string;
}

// Update CursorListPage to use the defined props
const CursorListPage = async ({ category, locale }: CursorListPageProps) => {
  const t = await getTranslations('cursor');
  const cursorCategories = getCursorCategories(locale);

  const srcList = getCursorDataList(category.src, locale);

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {srcList.map((item: any, index: number) => (
          <Link key={index} href={item.url}>
            <div className="group p-6 border-0 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-sm relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {item.icon_url || item.website ? (
                    <div className="border border-gray-200 p-1 rounded-md bg-white">
                      {item.icon_url ? (
                        <Image width={20} height={20} src={item.icon_url} alt={`${item.name} favicon`} loading='lazy'/>
                      ) : (
                        <img width="20" height="20" src={`https://favicon.im/${item.website}?larger=true`} alt={`${item.name} favicon`} loading='lazy'/>
                      )}
                    </div>
                  ) : null}
                  <h3 className="font-semibold text-xl text-foreground">{item.name}</h3>
                </div>
                <button className="text-muted-foreground hover:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3 text-sm">
                <span className="text-muted-foreground">by</span>
                <span className="font-medium text-blue-500 hover:text-blue-600 transition-colors">{item.author || 'Anonymous'}</span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {item.tags && item.tags.slice(0, 3).map((tag: string, index: number) => (
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
          </Link>
        ))}
      </div>
    </section>
  )
}

const CursorList = ({ category, cursorList, locale }: CursorListProps) => {
  const t = useTranslations('cursor')

  // Limit to 8 items for the main page display
  const limitedCursorList = cursorList.slice(0, 8);

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
          href={`/cursor/${category.link}`}
          className="group flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
        >
          {t('viewAll')}
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {limitedCursorList.map((item, index) => (
          <Link key={index} href={item.url}>
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
                <span className="font-medium text-blue-500 hover:text-blue-600 transition-colors">{item.author || 'Anonymous'}</span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {item.tags && item.tags.slice(0, 3).map((tag: string, index: number) => (
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
          </Link>
        ))}
      </div>
    </section>
  )
} 

export { CursorList, CursorListPage }