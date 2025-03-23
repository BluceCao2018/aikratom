import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CursorSidebar } from '@/components/CursorSidebar';
import { getCursorByLink, getCursorCategories, getCursorDataList } from '@/lib/data';
import type { CursorCategory } from '@/types';
import { CursorRuleDetail } from "@/components/CursorRuleDetail";

interface Props {
  params: {
    locale: string;
    category: string;
    name: string;
  };
}

interface CursorRule {
  name: string;
  description: string;
  url: string;
  rules: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('cursor');
  const w = await getTranslations('website');
  const locale = await getLocale();
  const cursorCategory = getCursorByLink(params.category, locale);
  const rules = getCursorDataList(params.category.toLowerCase() + ".jsonc", locale) as CursorRule[];
  const rule = rules.find((r) => r.url.toLowerCase() === `/cursor/${params.category}/${params.name}`.toLowerCase());
  
  return {
    title: `${params.name}`,
    description: rule ? rule.rules.slice(0, 155) + '...' : `Find the best practices Cursor Rules for ${cursorCategory?.name || ''}`,
    alternates: {
      canonical: w("domain") + "/cursor/" + params.category + "/" + params.name
    }
  }
}

export default async function Page({ params }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("cursor");
  const categories = await getCursorCategories(params.locale);

  const allCategories = categories.map((category: CursorCategory) => ({
    ...category,
    count: getCursorDataList(category.link.toLowerCase() + ".jsonc", locale).length
  }));

  const category = categories.find((c: CursorCategory) => c.name.toLowerCase() === params.category.toLowerCase());
  if (!category) {
    notFound();
  }

  const rules = getCursorDataList(category.link.toLowerCase() + ".jsonc", locale) as CursorRule[];
  const rule = rules.find((r) => r.url.toLowerCase() === `/cursor/${params.category}/${params.name}`.toLowerCase());
  if (!rule) {
    notFound();
  }

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
                <BreadcrumbLink href={`/cursor/${category.link}`}>{category.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='capitalize'>{rule.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        <div className="mt-6 flex gap-6">
          <div className="hidden lg:block w-64">
            <CursorSidebar categories={allCategories} locale={params.locale} />
          </div>
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                {rule.name}
              </h1>
              <p className="mt-2 text-muted-foreground">{rule.description}</p>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-lg border">
              <CursorRuleDetail 
                content={rule.rules} 
                title={rule.name}
                url={rule.url}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 