'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { VoiceInput } from '@/components/VoiceInput'

interface ReviewQuestion {
  id: number
  japanese_text: string
  english_answer: string
  created_at: string
}

export default function ReviewPage() {
  const { getAuthHeader, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [questions, setQuestions] = useState<ReviewQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [isFetching, setIsFetching] = useState(true)  // 名前を変更

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        fetchReviewQuestions()
      }
    }
  }, [isLoading, isAuthenticated, router])

  const fetchReviewQuestions = async () => {
    try {
      setIsFetching(true)  // 変更した名前を使用
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/favorites`, {
        headers: getAuthHeader(),
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch questions')
      }
      
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error('Error fetching review questions:', error)
    } finally {
      setIsFetching(false)  // 変更した名前を使用
    }
  }

  const handleVoiceInput = (text: string) => {
    setUserAnswer(text)
  }

  const currentQuestion = questions[currentIndex]

  if (isLoading || isFetching) {  // 両方のローディング状態をチェック
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  // ... 残りのコードは同じ ...

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <header className="border-b dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">復習問題</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-2xl mx-auto p-4">
          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            保存された問題がありません。問題を解いて保存してください。
          </p>
          <div className="text-center mt-4">
            <Link href="/">
                <Button>問題を解く</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">復習問題</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {questions.length}
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-900 dark:text-white">{currentQuestion.japanese_text}</p>
          </div>

          <div className="space-y-4">
            <label htmlFor="answer-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              英訳を入力
            </label>
            <div className="flex gap-2">
              <input
                id="answer-input"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="flex-1 p-2 border dark:border-gray-700 rounded-lg
                          bg-white dark:bg-gray-800 
                          text-gray-900 dark:text-white"
                placeholder="英語で回答してください"
              />
              <VoiceInput onResult={handleVoiceInput} />
            </div>
          </div>

          <Button
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full"
          >
            {showAnswer ? '解答を隠す' : '解答を見る'}
          </Button>

          {showAnswer && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                模範解答:
              </h3>
              <p className="text-green-800 dark:text-green-200">
                {currentQuestion.english_answer}
              </p>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(i => i - 1)
                setShowAnswer(false)
                setUserAnswer('')
              }}
              disabled={currentIndex === 0}
              className="w-full"
            >
              前の問題
            </Button>
            <Button
              onClick={() => {
                setCurrentIndex(i => i + 1)
                setShowAnswer(false)
                setUserAnswer('')
              }}
              disabled={currentIndex === questions.length - 1}
              className="w-full"
            >
              次の問題
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}