'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="border-b dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            英語学習アプリ
          </h1>
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
              
              <Link 
                href="/review"
                className="block p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  復習問題
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  保存した問題を復習できます。お気に入りの問題を繰り返し練習して、英語力を向上させましょう。
                </p>
              </Link>

              <Link 
                href="/translation"
                className="block p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  英訳サポート
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  自分で英訳できない文章をAIに翻訳してもらい、その解説を受けられます。役立つ表現を復習問題として保存できます。
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}