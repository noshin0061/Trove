'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Question, QuestionResponse, AnswerResponse, FavoriteResponse } from '@/types'
import { ThemeToggle } from '@/components/theme-toggle'
import { VoiceInput } from '@/components/VoiceInput'
import Link from 'next/link'
import { ArrowLeft, Star, StarOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function QuestionsPage() {
  const { isAuthenticated, isLoading, getAuthHeader } = useAuth()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [editableQuestion, setEditableQuestion] = useState('')
  const [editableAnswer, setEditableAnswer] = useState('')

  // QuestionsPage.tsx の一部を修正

const generateNewQuestion = async () => {
    try {
      setIsSubmitting(true)
      const headers = getAuthHeader();
      console.log('Request headers:', headers); // デバッグ用
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include'  // 認証情報を含める
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', {
          status: response.status,
          data: errorData
        });
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(errorData.detail || 'Failed to generate question');
      }
      
      const data: QuestionResponse = await response.json()
      console.log('Question generated:', data); // デバッグ用
      setQuestion({
        id: data.id,
        japanese_text: data.japanese_text,
      })
      setAnswer('')
      setFeedback('')
      setIsFavorite(false)
    } catch (error) {
      console.error('Error generating question:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  useEffect(() => {
    const initializeQuestions = async () => {
      if (!isLoading) {
        console.log('Auth state:', { isAuthenticated, isLoading }); // デバッグ用
        if (!isAuthenticated) {
          router.push('/login')
        } else {
          try {
            await generateNewQuestion()
          } catch (error) {
            console.error('Error in initialization:', error)
          }
        }
      }
    }
  
    initializeQuestions()
  }, [isLoading, isAuthenticated, router])

  const submitAnswer = async () => {
    if (!question || !answer.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          question_id: question.id,
          answer_text: answer
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data: AnswerResponse = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFavorite = async () => {
    if (!question) return

    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/${question.id}/favorite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }

      const data: FavoriteResponse = await response.json()
      setIsFavorite(data.is_favorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoiceInput = (text: string) => {
    setAnswer(text)
  }

  // ダイアログを開く時に現在の値をセット
  const handleOpenDialog = () => {
    setEditableQuestion(question?.japanese_text || '')
    setEditableAnswer(answer)
    setIsSaveDialogOpen(true)
  }

  // 新しい関数：問題を保存する
  // 修正した問題を保存する
  const handleSaveQuestion = async () => {
    if (!question) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/save-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify({
          question_id: question.id,
          japanese_text: editableQuestion, // 編集された問題文を使用
          english_answer: editableAnswer   // 編集された回答を使用
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save question')
      }

      setIsSaveDialogOpen(false)
      // オプション: 元の問題文と回答も更新する場合
      setQuestion(prev => prev ? {...prev, japanese_text: editableQuestion} : null)
      setAnswer(editableAnswer)
    } catch (error) {
      console.error('Error saving question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="border-b dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              英作文練習
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/review"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              復習問題へ
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                問題
              </h2>
              <button
                onClick={toggleFavorite}
                disabled={isSubmitting || !question}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFavorite ? 
                  <Star className="text-yellow-400" /> : 
                  <StarOff className="text-gray-400" />
                }
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white">
                {question?.japanese_text || 'Loading...'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label 
              htmlFor="answer-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              英訳を入力
            </label>
            <div className="flex gap-2">
              <input
                id="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 p-2 border dark:border-gray-700 rounded-lg
                          bg-white dark:bg-gray-800 
                          text-gray-900 dark:text-white
                          disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="英語で回答してください"
              />
              <VoiceInput onResult={handleVoiceInput} />
            </div>
          </div>

          <Button
            onClick={submitAnswer}
            disabled={isSubmitting || !answer.trim() || !question}
            className="w-full"
          >
            {isSubmitting ? '送信中...' : '回答を確認'}
          </Button>

          {feedback && (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  フィードバック
                </h3>
                <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {feedback}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleOpenDialog}
                className="w-full"
              >
                問題を保存
              </Button>
            </>
          )}

          <Button
            onClick={generateNewQuestion}
            disabled={isSubmitting}
            variant="secondary"
            className="w-full"
          >
            次の問題へ
          </Button>
        </div>
      </main>

      {/* Dialogの実装は変更なし */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>問題を保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">問題文</label>
              <Textarea
                value={editableQuestion}
                onChange={(e) => setEditableQuestion(e.target.value)}
                className="mt-1"
                placeholder="問題文を入力"
              />
            </div>
            <div>
              <label className="text-sm font-medium">解答</label>
              <Textarea
                value={editableAnswer}
                onChange={(e) => setEditableAnswer(e.target.value)}
                className="mt-1"
                placeholder="解答を入力"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsSaveDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleSaveQuestion}
              disabled={!editableQuestion.trim() || !editableAnswer.trim()}
            >
              保存する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}