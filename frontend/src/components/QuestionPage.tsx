'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Question, QuestionResponse, AnswerResponse, FavoriteResponse } from '@/types'
import { ThemeToggle } from '@/components/theme-toggle'
import { VoiceInput } from '@/components/VoiceInput'
import Link from 'next/link'
import { ArrowLeft, Star, StarOff } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'


export default function QuestionsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading, getAuthHeader } = useAuth()
    const [question, setQuestion] = useState<Question | null>(null)
    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

    const generateNewQuestion = useCallback(async () => {
        try {
            setIsSubmitting(true);
            const headers = getAuthHeader();
            console.log('Auth headers for request:', headers); // デバッグ用

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                credentials: 'include' // 認証情報を含める
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', {
                    status: response.status,
                    data: errorData
                });
                if (response.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error(errorData.detail || 'Failed to generate question');
            }

            const data: QuestionResponse = await response.json();
            setQuestion({
                id: data.id,
                japanese_text: data.japanese_text,
            });
            setAnswer('');
            setFeedback('');
            setIsFavorite(false);
        } catch (error) {
            console.error('Error generating question:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [getAuthHeader, router]);

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                console.log('User is authenticated, generating question...'); // デバッグ用
                generateNewQuestion();
            } else {
                console.log('User is not authenticated, redirecting to login...'); // デバッグ用
                router.push('/login');
            }
        }
    }, [isLoading, isAuthenticated, generateNewQuestion, router]);

    // submitAnswer と toggleFavorite も同様に修正
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
            credentials: 'include',  // 追加
            body: JSON.stringify({
              question_id: question.id,
              answer_text: answer
            })
          })
      
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
              router.push('/login');
              return;
            }
            throw new Error(errorData.detail || 'Failed to submit answer');
          }
      
          const data: AnswerResponse = await response.json()
          setFeedback(data.feedback)
        } catch (error) {
          console.error('Error submitting answer:', error)
        } finally {
          setIsSubmitting(false)
        }
    }

  const toggleFavorite = useCallback(async () => {
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
  }, [question, getAuthHeader]); // 必要な依存関係を追加

  const handleVoiceInput = useCallback((text: string) => {
    setAnswer(text)
  }, []); // 依存関係なし

  const handleSaveQuestion = async (japaneseText: string, englishAnswer: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/save-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify({
          question_id: question?.id,
          japanese_text: japaneseText,
          english_answer: englishAnswer
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save question')
      }

      setIsSaveDialogOpen(false)
      // 成功通知を表示
    } catch (error) {
      console.error('Error saving question:', error)
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
    <>
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
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                問題を保存
              </Button>
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
          {/* ... 他のメインコンテンツは変更なし ... */}
        </main>

        {/* Dialogの実装 */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>問題を保存</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">問題文</label>
                <Textarea
                  value={question?.japanese_text || ''}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">解答</label>
                <Textarea
                  value={answer}
                  readOnly
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={() => {
                  handleSaveQuestion(question?.japanese_text || '', answer);
                  setIsSaveDialogOpen(false);
                }}
              >
                保存する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}