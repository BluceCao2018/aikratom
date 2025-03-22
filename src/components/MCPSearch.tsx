'use client' // 标记为客户端组件

import React from 'react'
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'

type MCPSearchProps = {
  category: string; // 从外部传递的分类参数
}

export function MCPSearch({ category }: MCPSearchProps) {
  const router = useRouter()
  const t = useTranslations('mcp')
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const keyword = (event.target as HTMLInputElement).value
      //if (keyword.length > 0) {
      if(category === 'all') {
        router.push(`/mcp?q=${encodeURIComponent(keyword)}`)
      } else {
        router.push(`/mcp/${category}?q=${encodeURIComponent(keyword)}`)
      }
      //}
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