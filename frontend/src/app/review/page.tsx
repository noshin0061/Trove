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
  const [isFetching, setIsFetching] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modelAnswer, setModelAnswer] = useState('')
  const [isModelAnswerAvailable, setIsModelAnswerAvailable] = useState(false)

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
      setIsFetching(true)
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
      console.log('Fetched review questions:', data);
      setQuestions(data)
    } catch (error) {
      console.error('Error fetching review questions:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleVoiceInput = (text: string) => {
    setUserAnswer(text)
  }

  const currentQuestion = questions[currentIndex]

  const extractModelAnswerFromFeedback = (feedback: string) => {
    const patterns = [
      /正確な答え[:：]\s*-\s*([^]*?)(?:\n|$)/m,
      /模範解答[:：]\s*-\s*([^]*?)(?:\n|$)/m,
      /Model answer[:：]\s*-\s*([^]*?)(?:\n|$)/i,
      /Correct answer[:：]\s*-\s*([^]*?)(?:\n|$)/i,
      /Example[:：]\s*-\s*([^]*?)(?:\n|$)/i,
      /例文[:：]\s*-\s*([^]*?)(?:\n|$)/
    ];
    
    const nonListPatterns = [
      /正確な答え[:：]\s*([^]*?)(?:\n\n|$)/m,
      /模範解答[:：]\s*([^]*?)(?:\n\n|$)/m,
      /Model answer[:：]\s*([^]*?)(?:\n\n|$)/i,
      /Correct answer[:：]\s*([^]*?)(?:\n\n|$)/i,
      /Example[:：]\s*([^]*?)(?:\n\n|$)/i,
      /例文[:：]\s*([^]*?)(?:\n\n|$)/
    ];
    
    for (const pattern of patterns) {
      const match = feedback.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    for (const pattern of nonListPatterns) {
      const match = feedback.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    const englishSentencePattern = /[A-Z][^.!?]*[.!?]/;
    const englishMatch = feedback.match(englishSentencePattern);
    if (englishMatch) {
      return englishMatch[0].trim();
    }
    
    return "";
  }

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/review/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          favorite_question_id: currentQuestion.id,
          answer_text: userAnswer,
          japanese_text: currentQuestion.japanese_text
        })
      })

      if (!response.ok) {
        if (response.status === 422) {
          console.error('Invalid request data:', {
            favorite_question_id: currentQuestion.id,
            answer_text: userAnswer,
            japanese_text: currentQuestion.japanese_text
          });
          throw new Error('Invalid request data');
        }
        throw new Error('Failed to submit answer');
      }

      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      console.error('Error submitting answer:', error)
      setFeedback('回答の確認中にエラーが発生しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    setCurrentIndex(i => i + 1)
    setShowAnswer(false)
    setUserAnswer('')
    setFeedback('')
    setModelAnswer('')
    setIsModelAnswerAvailable(false)
  }

  const handlePrevQuestion = () => {
    setCurrentIndex(i => i - 1)
    setShowAnswer(false)
    setUserAnswer('')
    setFeedback('')
    setModelAnswer('')
    setIsModelAnswerAvailable(false)
  }

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

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
            onClick={submitAnswer}
            disabled={isSubmitting || !userAnswer.trim()}
            className="w-full"
          >
            {isSubmitting ? '送信中...' : '回答を確認'}
          </Button>

          {feedback && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                フィードバック
              </h3>
              <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                {feedback}
              </p>
            </div>
          )}

          <Button
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full"
          >
            {showAnswer ? '解答を隠す' : '解答を見る'}
          </Button>

          {showAnswer && currentQuestion && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                模範解答
              </h3>
              <p className="text-green-800 dark:text-green-200">
                {currentQuestion.english_answer}
              </p>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="w-full"
            >
              前の問題
            </Button>
            <Button
              onClick={handleNextQuestion}
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