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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* @ts-ignore */}
        {srcList.map((resource: toolProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105'>
            <CardHeader>
              <a 
                href={`${resource.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <div className='border border-gray-200 p-1 rounded-md mr-1 bg-white'>
                  {/* <img width="20" height="20" src={`https://favicon.im/${resource.url}?larger=true`} alt={`${resource.name} favicon`} /> */}
                  { resource.icon_url ?
                    <Image width={20} height={20} src={resource.icon_url}  alt={`${resource.name} favicon`} loading='lazy'/>
                    :
                    <img width="20" height="20" src={`https://favicon.im/${resource.website}?larger=true`} alt={`${resource.name} favicon`} loading='lazy'/>
                  }
                </div>
                <CardTitle className='capitalize tracking-tighter'>{resource.name}</CardTitle>
                <ExternalLink size={16} className='ml-1' />
              </a>
              <CardDescription className='flex flex-col justify-between '>
                <div className='h-[60px] line-clamp-3 mt-1 tracking-tight text-start'>
                  {resource.description}
                </div>
                { resource.tags ? 
                  <div className='mt-3'>
                  {resource.tags.slice(0,3).map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className='text-xs pb-1 mr-1 mt-2 tracking-tighter'>{tag}</Badge>
                  ))}
                </div> :
                 null
                }     
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )

  return (
    <div className="container mx-auto py-12 space-y-16">
      <section className="flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="mx-auto max-w-3xl text-2xl font-bold lg:text-5xl tracking-tighter">
          <span className="inline-block">Cursor Tools</span>
        </h1>
        <h2 className="text-2xl tracking-tight sm:text-2xl md:text-2xl lg:text-2xl">
          {t("h2")}
        </h2>
        <p className="mx-auto max-w-[700px] md:text-xl tracking-tight">
          {t("description")}
        </p>
      </section>
      
      {cursorCategories.map((category: { name: string; src: string; description: string; link: string }, index: number) => {
        const cursorList = getCursorDataList(category.src, locale); 
        return (
          <CursorList 
            key={index} 
            category={category} 
            cursorList={cursorList}
            locale={locale} 
          />
        );
      })}
    </div>
  );
}

const CursorList = ({ category, cursorList, locale }: CursorListProps) => {
  const t = useTranslations('cursor')

  const IconComponent = ({ name }: { name: string }) => {
    const icons = {
      tool: <MousePointer />,
      code: <Code />,
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
          href={`/cursor/${category.link}`}
          className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
        >
          {t('viewAll')}
          <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cursorList.map((cursor: any) => (
          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <IconComponent name={cursor.type} />
              </div>

              <div>
                <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cursor.name}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {cursor.description}
                </p>
              </div>

              {cursor.tags && (
                <div className="flex flex-wrap gap-2">
                  {cursor.tags.map((tag: string) => (
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
                  href={cursor.url}
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
                    {cursor.stars}
                  </span>
                  <span className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {cursor.downloads}
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

export { CursorList, CursorListPage }