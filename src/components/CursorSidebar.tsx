import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CursorCategory } from '@/types';

interface CursorSidebarProps {
  categories: CursorCategory[];
  currentCategory?: string;
  locale: string;
}

export function CursorSidebar({ categories, currentCategory, locale }: CursorSidebarProps) {
  return (
    <div className="w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r">
      <nav className="space-y-1 p-4">
        {categories.map((category) => (
          <Link
            key={category.link}
            href={`/${locale}/cursor/${category.link}`}
            className={cn(
              "flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              currentCategory === category.link
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <span className="capitalize">{category.name}</span>
            <span className="text-xs font-mono">{category.count || 0}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 