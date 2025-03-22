import React from 'react';
import { getCursorDataList, getCursorByLink } from '@/lib/data';
import { ToolsPage } from '@/components/ToolsList';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CursorListPage } from '@/components/CursorList';

export async function generateMetadata() {
  const t = await getTranslations('cursor');
  const w = await getTranslations('website');
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical: w("domain") + "/cursor"
    }
  }
}

export default async function CursorCategory({ params }: { params: { category: string } }) {
  const locale = await getLocale();
  const cursorCategory = getCursorByLink(params.category, locale);
  const t = await getTranslations('cursor');

  if (!cursorCategory) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-12">
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
      <div className="flex flex-col justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight capitalize lg:text-5xl pt-10">{cursorCategory.h1}</h1>
        <h2 className="text-md mt-2 opacity-60 lg:text-xl">{cursorCategory.h1description}</h2>
      </div>
      <CursorListPage category={cursorCategory} locale={locale} />
      <div className="flex flex-col justify-between items-center mt-12">
        <h2 className='text-sm mt-2 opacity-60 lg:text-md'>{t('h2description')}</h2>
      </div>
    </div>
  )
} 