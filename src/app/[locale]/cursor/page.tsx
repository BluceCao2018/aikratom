import { getCursorCategories, getCursorDataList } from '@/lib/data';
import { CursorList } from '@/components/CursorList';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function CursorHome() {
  const locale = await getLocale();
  const t = await getTranslations('cursor');
  const cursorCategories = getCursorCategories(locale);

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