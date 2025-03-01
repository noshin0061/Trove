// components/Navigation.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export function Navigation() {
  const { isAuthenticated, isLoading } = useAuth()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // マウント前はデフォルトのロゴを表示
  const logoSrc = !mounted ? '/Trove_logo_black.png' : 
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark') 
      ? '/Trove_logo_white.png' 
      : '/Trove_logo_black.png'

  return (
    <header className="border-b dark:border-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-16 h-8">
              <Image
                src={logoSrc}
                alt="英語学習アプリロゴ"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            {/* <span className="text-xl font-bold text-gray-900 dark:text-white">
              英作文練習
            </span> */}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {!isLoading && (
            <Link
              href={isAuthenticated ? '/logout' : '/login'}
              className={`font-medium ${
                isAuthenticated 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isAuthenticated ? 'ログアウト' : 'ログイン'}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}