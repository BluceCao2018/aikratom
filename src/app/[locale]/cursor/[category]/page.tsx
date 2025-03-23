import React from 'react';
import { getCursorDataList, getCursorByLink, getCursorCategories } from '@/lib/data';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CursorSidebar } from '@/components/CursorSidebar';
import { CursorRuleGrid } from '@/components/CursorRuleGrid';
import type { CursorCategory } from '@/types';

interface RawCursorRule {
  name: string;
  description: string;
  url: string;
  rules: string;
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const t = await getTranslations('cursor');
  const w = await getTranslations('website');
  const locale = await getLocale();
  const cursorCategory = getCursorByLink(params.category, locale);
  
  return {
    title: `Cursor Rules for ${cursorCategory?.name || ''} - ${t('meta_title')}`,
    description: `Find the best practices Cursor Rules for ${cursorCategory?.name || ''}`,
    alternates: {
      canonical: w("domain") + "/cursor/" + params.category
    }
  }
}

export default async function CursorCategory({ params }: { params: { category: string } }) {
  const locale = await getLocale();
  const cursorCategory = getCursorByLink(params.category, locale);
  const categories = getCursorCategories(locale);
  const t = await getTranslations('cursor');

  if (!cursorCategory) {
    return notFound();
  }

  // Calculate counts for each category
  const allCategories = categories.map((category: CursorCategory) => ({
    ...category,
    count: getCursorDataList(category.link.toLowerCase() + ".jsonc", locale).length
  }));

  const categoryName = cursorCategory.name;
  const rawRules = getCursorDataList(params.category.toLowerCase() + ".jsonc", locale) as RawCursorRule[];
  
  // Transform the data into the format expected by CursorRuleGrid
  const formattedRules = rawRules.map((rule) => ({
    title: rule.name,
    content: rule.rules || '',
    url: rule.url
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-blue-950/10">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#6B728015_1px,transparent_1px),linear-gradient(to_bottom,#6B728015_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="container relative mx-auto py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cursor">{t('cursorBtn')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='capitalize'>{cursorCategory.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 flex gap-6">
          <CursorSidebar
            categories={allCategories}
            currentCategory={params.category}
            locale={locale}
          />
          
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight capitalize">
                Cursor Rules For <span className='text-blue-500'>{categoryName}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Find Awesome Cursor Rules for {cursorCategory.description}
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur-sm rounded-lg border">
              <CursorRuleGrid rules={formattedRules} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 