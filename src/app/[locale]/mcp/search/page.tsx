import { searchMCPByKeyword } from '@/lib/data'
import { Card } from "@/components/ui/card"
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const locale = await getLocale()
  const t = await getTranslations('mcp')
  const keyword = searchParams.q
  const results = searchMCPByKeyword(keyword, locale)

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">
        {t('searchResults', { keyword })}
      </h1>
      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">{t('noResults', { keyword })}</h2>
          <p className="text-muted-foreground">{t('tryAnotherSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((mcp: any) => (
            <Card key={mcp.name} className="p-4 space-y-2">
              <h3 className="font-medium">{mcp.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {mcp.description}
              </p>
              {mcp.tags && (
                <div className="flex gap-2 flex-wrap">
                  {mcp.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-muted rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <Link
                  href={mcp.url}
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
  )
} 