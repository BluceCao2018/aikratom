import React from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { getAboutContent } from '@/lib/posts';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function generateMetadata() {
    const t = await getTranslations('about');
    return {
        title: t('meta_title'),
        description: t('meta_description'),
    }
}

export default async function AboutPage() {
    const locale = await getLocale();
    const t = await getTranslations('about');
    const contentHtml = await getAboutContent(locale);

    return (
        
        <div className="container mx-auto py-12 space-y-16 min-h-screen">
            <section className="text-center space-y-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">{t('homeBtn')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{t('aboutBtn')}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </section>

            <article className="container mx-auto px-4 py-12 max-w-3xl">
                {/* Article content */}
      <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml ?? '' }}
            />
            </article>
        </div>
    );
}
