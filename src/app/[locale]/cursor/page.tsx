import { getCursorCategories, getCursorDataList } from '@/lib/data';
import { CursorList } from '@/components/CursorList';
import { getTranslations, getLocale } from 'next-intl/server';
import { CursorSearch } from '@/components/CursorSearch';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type CursorCategory = {
  name: string;
  src: string;
  description: string;
  link: string;
};

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

export default async function CursorHome({ searchParams }: { searchParams: { q?: string } }) {
  const locale = await getLocale();
  const t = await getTranslations('cursor');
  const cursorCategories = getCursorCategories(locale);
  const keyword = searchParams.q || '';

  // Filter function for search
  const filterByKeyword = (items: any[]) => {
    if (!keyword) return items;
    return items.filter((item: any) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      item.description.toLowerCase().includes(keyword.toLowerCase())
    );
  };

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
              <BreadcrumbPage className='capitalize'>{t('cursorBtn')}</BreadcrumbPage>
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
              
              <p className="mx-auto max-w-[700px] md:text-xl tracking-tight text-muted-foreground">
                {t("description")}
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <CursorSearch />
                  <div className="absolute inset-0 -z-10 blur-xl group-hover:blur-2xl transition-all bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-16 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/80 to-white/90 dark:from-transparent dark:via-gray-950/80 dark:to-gray-950/90" />
          
          {cursorCategories.map((category: CursorCategory, index: number) => {
            const cursorList = filterByKeyword(getCursorDataList(category.src, locale));
            if (keyword && cursorList.length === 0) return null;
            
            return (
              <CursorList 
                key={index} 
                category={category} 
                cursorList={cursorList}
                locale={locale} 
              />
            );
          })}

          {keyword && !cursorCategories.some((category: CursorCategory) => filterByKeyword(getCursorDataList(category.src, locale)).length > 0) && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        <section className="py-24 space-y-12">
          <h2 className="text-3xl font-bold tracking-tight text-center">Understanding Cursor Rules</h2>
          <div className="grid gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">What are Cursor Rules?</h3>
              <p className="text-muted-foreground">
                Cursor Rules are comprehensive guidelines that help developers write better code. These rules encompass best practices, coding standards, and development patterns that ensure consistency and maintainability across projects. Whether you're working with React, Next.js, or other frameworks, Cursor Rules provide the structure needed for efficient development.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Benefits of Using Cursor Rules</h3>
              <p className="text-muted-foreground">
                Implementing Cursor Rules in your development workflow brings numerous advantages. These rules help maintain code quality, improve team collaboration, and ensure consistent coding standards. By following Cursor Rules, developers can write more maintainable and scalable code while reducing technical debt.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Types of Cursor Rules</h3>
              <p className="text-muted-foreground">
                Different projects may require different sets of Cursor Rules. From JavaScript and TypeScript rules to framework-specific guidelines, Cursor Rules can be customized to fit your project's needs. These rules cover everything from code formatting to architectural patterns, ensuring comprehensive code quality control.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Implementing Cursor Rules in Your Project</h3>
              <p className="text-muted-foreground">
                Getting started with Cursor Rules is straightforward. Begin by selecting the appropriate rule set for your project's technology stack. Whether you're using Cursor Rules for React components or Next.js applications, these guidelines will help maintain code quality and consistency throughout your development process.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Advanced Cursor Rules Features</h3>
              <p className="text-muted-foreground">
                Beyond basic coding standards, Cursor Rules offer advanced features for complex development scenarios. These include specialized rules for performance optimization, accessibility compliance, and security best practices. Advanced Cursor Rules help teams build robust and efficient applications.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Customizing Cursor Rules</h3>
              <p className="text-muted-foreground">
                Every team has unique requirements, and Cursor Rules can be adapted to meet these needs. Whether you're working on a small project or a large enterprise application, Cursor Rules can be customized to align with your team's coding standards and best practices.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 