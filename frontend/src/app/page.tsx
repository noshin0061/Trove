'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="border-b dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            英語学習アプリ
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              機能一覧
            </h2>
            <div className="space-y-4">
              <Link 
                href="/questions"
                className="block p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  英作文練習
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  AIを使用して英作文の練習ができます。音声入力にも対応しています。
                </p>
              </Link>
              
              {/* 今後追加される機能のためのプレースホルダー */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                  Coming Soon...
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  新しい機能を準備中です
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
