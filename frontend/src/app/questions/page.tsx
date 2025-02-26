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
import { StyleVariationButtons } from "@/components/StyleVariationButtons"

export default function QuestionsPage() {
  const { isAuthenticated, isLoading, getAuthHeader } = useAuth()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [modelAnswer, setModelAnswer] = useState('') // フィードバックから抽出したモデル解答
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [editableQuestion, setEditableQuestion] = useState('')
  const [editableAnswer, setEditableAnswer] = useState('')
  const [isGeneratingTranslation, setIsGeneratingTranslation] = useState(false)
  const [isModelAnswerAvailable, setIsModelAnswerAvailable] = useState(false) // モデル解答が利用可能かどうか
  const [isGettingVariation, setIsGettingVariation] = useState(false)
  const [showVariationButtons, setShowVariationButtons] = useState(false)

  // フィードバックからモデル解答を抽出する関数
  const extractModelAnswerFromFeedback = (feedback: string) => {
    // 「正確な答え:」や「模範解答:」の後に続く英文を探す（箇条書き対応）
    const patterns = [
      /正確な答え[:：]\s*-\s*([^]*?)(?:\n|$)/m,
      /模範解答[:：]\s*-\s*([^]*?)(?:\n|$)/m,
      /Model answer[:：]\s*-\s*([^]*?)(?:\n|$)/i,
      /Correct answer[:：]\s*-\s*([^]*?)(?:\n|$)/i,
      /Example[:：]\s*-\s*([^]*?)(?:\n|$)/i,
      /例文[:：]\s*-\s*([^]*?)(?:\n|$)/
    ];
    
    // リストの形式でない場合のパターン
    const nonListPatterns = [
      /正確な答え[:：]\s*([^]*?)(?:\n\n|$)/m,
      /模範解答[:：]\s*([^]*?)(?:\n\n|$)/m,
      /Model answer[:：]\s*([^]*?)(?:\n\n|$)/i,
      /Correct answer[:：]\s*([^]*?)(?:\n\n|$)/i,
      /Example[:：]\s*([^]*?)(?:\n\n|$)/i,
      /例文[:：]\s*([^]*?)(?:\n\n|$)/
    ];
    
    // 箇条書き形式のパターンを先に試す
    for (const pattern of patterns) {
      const match = feedback.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // 通常の形式のパターンを試す
    for (const pattern of nonListPatterns) {
      const match = feedback.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // パターンに一致しない場合は、英文を探す
    const englishSentencePattern = /[A-Z][^.!?]*[.!?]/;
    const englishMatch = feedback.match(englishSentencePattern);
    if (englishMatch) {
      return englishMatch[0].trim();
    }
    
    // 何も見つからない場合は空文字列を返す
    return "";
  }

  // 新しい問題を生成
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
      setModelAnswer('') // モデル解答をリセット
      setIsModelAnswerAvailable(false) // モデル解答の利用可能フラグをリセット
      setIsFavorite(false)
      setShowVariationButtons(false) // スタイルバリエーションボタンを非表示にリセット
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

  // フィードバックが更新されたときにモデル解答を抽出する
  useEffect(() => {
    if (feedback) {
      console.log('フィードバック受信:', feedback); // デバッグ用
      const extractedAnswer = extractModelAnswerFromFeedback(feedback);
      console.log('抽出されたモデル解答:', extractedAnswer); // デバッグ用
      setModelAnswer(extractedAnswer);
      setIsModelAnswerAvailable(!!extractedAnswer);
    }
  }, [feedback]);

  // showVariationButtonsの状態変化をログ出力
  useEffect(() => {
    console.log('showVariationButtons状態:', showVariationButtons);
  }, [showVariationButtons]);

  const submitAnswer = async () => {
    if (!answer.trim() || !question) return

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
          answer_text: answer,
          japanese_text: question.japanese_text
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await response.json()
      setFeedback(data.feedback)
      
      // スタイルバリエーションボタンを表示するフラグをtrueに設定
      setShowVariationButtons(true)
      console.log('回答送信完了、スタイルボタン表示フラグをtrueに設定'); // デバッグ用
    } catch (error) {
      console.error('Error submitting answer:', error)
      setFeedback('回答の確認中にエラーが発生しました。')
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

  // AI翻訳を取得する関数
  const getAiTranslation = async (japaneseText: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/translation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify({
          japanese_text: japaneseText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI translation')
      }

      const data = await response.json()
      return data.translation
    } catch (error) {
      console.error('Error getting AI translation:', error)
      return null
    }
  }

  // ダイアログを開く時に現在の値をセット
  const handleOpenDialog = async () => {
    if (!question) return
    
    setEditableQuestion(question.japanese_text)
    
    // モデル解答が利用可能ならそれを使用
    if (isModelAnswerAvailable && modelAnswer) {
      setEditableAnswer(modelAnswer);
      setIsGeneratingTranslation(false);
    } 
    // モデル解答が無い場合は、ユーザーの回答があればそれを使用
    else if (answer.trim()) {
      setEditableAnswer(answer);
      setIsGeneratingTranslation(false);
    } 
    // それもない場合はAI翻訳を取得
    else {
      try {
        setIsGeneratingTranslation(true);
        const translation = await getAiTranslation(question.japanese_text);
        if (translation) {
          setEditableAnswer(translation);
        } else {
          setEditableAnswer('');
        }
      } catch (error) {
        console.error('Error in AI translation:', error);
        setEditableAnswer('');
      } finally {
        setIsGeneratingTranslation(false);
      }
    }
    
    setIsSaveDialogOpen(true);
  }

  // 問題を保存する
  const handleSaveQuestion = async () => {
    if (!question) return

    try {
      setIsSubmitting(true)
      
      // 保存するテキストを決定（モデル解答がある場合はそれを優先）
      const answerToSave = isModelAnswerAvailable && modelAnswer ? modelAnswer : editableAnswer;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/save-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify({
          question_id: question.id,
          japanese_text: editableQuestion,
          english_answer: answerToSave // モデル解答または編集内容
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save question')
      }

      setIsSaveDialogOpen(false)
      // 元の問題文を更新
      setQuestion(prev => prev ? {...prev, japanese_text: editableQuestion} : null)
    } catch (error) {
      console.error('Error saving question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStyleVariation = async (variationType: string) => {
    if (!question) return
    console.log('Starting style variation request for type:', variationType) // デバッグログ

    try {
      setIsGettingVariation(true)
      const requestBody = {
        japanese_text: question.japanese_text,
        user_answer: answer,
        variation_type: variationType
      }
      console.log('Request body:', requestBody) // デバッグログ

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/style-variation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status) // デバッグログ

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', errorData) // デバッグログ
        throw new Error('Failed to get style variation')
      }

      const data = await response.json()
      console.log('Success response:', data) // デバッグログ
      
      setFeedback(prev => `${prev}\n\n【${variationType.startsWith('context') ? 'カスタム' : variationType === 'formal' ? 'フォーマル' : 'カジュアル'}な表現】\n${data.feedback}`)
    } catch (error) {
      console.error('Error getting style variation:', error)
    } finally {
      setIsGettingVariation(false)
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
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  フィードバック
                </h3>
                <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {feedback}
                </p>
              </div>

              {/* スタイルバリエーションボタン */}
              {showVariationButtons && (
                <div className="mt-4">
                  <StyleVariationButtons
                    japaneseText={question?.japanese_text || ''}
                    userAnswer={answer}
                    onGetVariation={getStyleVariation}
                    isLoading={isGettingVariation}
                  />
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleOpenDialog}
                disabled={isGeneratingTranslation}
                className="w-full"
              >
                {isGeneratingTranslation ? 'AI翻訳を生成中...' : '問題を保存'}
              </Button>
            </div>
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
              {isModelAnswerAvailable && (
                <p className="text-xs text-gray-500 mt-1">
                  ※フィードバックから抽出した模範解答が入力されています。編集しても保存時には模範解答が使用されます。
                </p>
              )}
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
              disabled={!editableQuestion.trim() || !editableAnswer.trim() || isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}