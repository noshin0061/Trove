import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 space-y-8">
      <h1 className="text-4xl font-bold text-center text-space-100">宇宙英語学習へようこそ</h1>
      <p className="text-xl text-center text-space-300">AIを活用した革新的な英語学習プラットフォーム</p>
      <div className="flex space-x-4">
        <Link href="/ai-questions" className="bg-space-600 hover:bg-space-700 text-white font-bold py-2 px-4 rounded">
          AI問題に挑戦
        </Link>
        <Link href="/vocabulary" className="bg-space-600 hover:bg-space-700 text-white font-bold py-2 px-4 rounded">
          単語を登録
        </Link>
      </div>
    </div>
  )
}

