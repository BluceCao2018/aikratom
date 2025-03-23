'use client'

import React from 'react'
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'

export function CursorSearch() {
  const router = useRouter()
  const t = useTranslations('cursor')
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const keyword = (event.target as HTMLInputElement).value
      router.push(`/cursor?q=${encodeURIComponent(keyword)}`)
    }
  }

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder={t('searchPlaceholder')}
        className="w-full border-2 border-blue-500 h-12"
        onKeyDown={handleKeyDown}
      />
    </div>
  )
} 