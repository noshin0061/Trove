// components/Header.tsx
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'  // インポートを追加
import Image from 'next/image'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Trove Logo"
              width={32}
              height={32}
              className="brightness-0 dark:brightness-100 dark:invert"
            />
            <span className="hidden font-bold sm:inline-block">
              Trove
            </span>
          </Link>
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