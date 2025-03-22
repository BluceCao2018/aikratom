// pages/index.js
import React, { Suspense } from 'react'; // 确保导入 React
import { getSortedPostsData } from '@/lib/posts'
import { getCategories } from '@/lib/data';

import { ToolsList } from '@/components/ToolsList';
import { ArticleList } from '@/components/ArticleList'

import { Search } from '@/components/Search';
import {getTranslations, getLocale} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('home');
  const w = await getTranslations('website');
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: w("domain")
    }
  };
}


type categoryType = { 
  name: string; 
  src: string; 
  description: string;
  link: string; 
}


export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  // categories data
  const categories = getCategories(locale);
  console.log('categories: ', categories)

  const sortedPosts = await getSortedPostsData("article")
  const allPostsData = sortedPosts.slice(0, 6)
  
  // deployment

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-blue-950/10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B728015_1px,transparent_1px),linear-gradient(to_bottom,#6B728015_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="container mx-auto py-12 space-y-16 relative">
        <section className="relative flex flex-col items-center justify-center text-center space-y-6">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/30 to-indigo-50/20 dark:from-gray-900/40 dark:via-blue-900/20 dark:to-indigo-900/10" />
          </div>
          <h1 className="mx-auto max-w-3xl text-2xl font-bold lg:text-5xl tracking-tighter">
            <span className="inline-block">AI Kratom</span>
          </h1>
          <h2 className="text-2xl tracking-tight sm:text-2xl md:text-2xl lg:text-2xl">{t("h2")}</h2>
          <p className="mx-auto max-w-[700px] md:text-xl tracking-tight">
            {t("description")}
          </p>
          <div className='w-full px-2 pt-10 lg:w-1/2'>
            <Search />
          </div>
        </section>
        
        {categories.map((category: categoryType, index: React.Key | null | undefined) => (
          <ToolsList key={index} category={category} locale={locale} />
        ))}
        <div className='border-t'></div>
        <Suspense fallback={<div>Loading editor...</div>}>
          <ArticleList articles={allPostsData} />
        </Suspense>
      </div>
    </div>
  )
}