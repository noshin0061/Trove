// components/Header.tsx
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'  // インポートを追加

export function Header() {
  return (
    <header className="border-b dark:border-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            英作文練習
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/logout"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ログアウト
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}