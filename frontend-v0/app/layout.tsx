import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "英単語学習",
  description: "生成AIを活用した英語学習アプリ",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <header className="bg-gray-800 p-4">
          <nav className="container mx-auto">
            <ul className="flex space-x-4">
              <li>
                <a href="/" className="hover:text-blue-400">
                  ホーム
                </a>
              </li>
              <li>
                <a href="/ai-questions" className="hover:text-blue-400">
                  AI問題
                </a>
              </li>
              <li>
                <a href="/vocabulary" className="hover:text-blue-400">
                  単語登録
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-gray-800 p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2023 英語学習. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

