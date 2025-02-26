'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function TranslationPage() {
  const { isAuthenticated, isLoading, getAuthHeader } = useAuth()
  const router = useRouter()
  const [japaneseText, setJapaneseText] = useState('')
  const [translation, setTranslation] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGettingVariation, setIsGettingVariation] = useState(false)

  // 認証チェック
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated && !isLoading) {
    router.push('/login')
    return null
  }

  const getTranslation = async () => {
    if (!japaneseText.trim()) return
    
    try {
      setIsTranslating(true)
      setTranslation('') // 既存の翻訳をクリア
      setFeedback('') // 既存のフィードバックをクリア

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
        throw new Error(`翻訳エラー: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data || !data.translation) {
        throw new Error('翻訳結果が不正です')
      }
      
      // 英訳とフィードバックを分離
      const translationMatch = data.translation.match(/英訳[:：](.*?)(?=\n|$)/)
      if (translationMatch) {
        setTranslation(translationMatch[1].trim())
      } else {
        setTranslation(data.translation) // マッチしない場合は全体を設定
      }
      
      if (data.explanation) {
        setFeedback(data.explanation)
      }
    } catch (error) {
      console.error('翻訳エラー:', error)
      setFeedback(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsTranslating(false)
    }
  }

  // 復習問題として保存
  const saveToReview = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/save-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify({
          japanese_text: japaneseText,
          english_answer: translation
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save translation')
      }

      // 保存成功
      setIsSaveDialogOpen(false)
      // フォームをリセット
      setJapaneseText('')
      setTranslation('')
      setFeedback('')
      
      // 成功メッセージ（オプション）
      alert('復習問題として保存しました')
    } catch (error) {
      console.error('Error saving translation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // スタイルバリエーション用の関数を追加
  const getStyleVariation = async (variationType: string) => {
    if (!japaneseText.trim()) return
    console.log('Getting style variation:', variationType)

    try {
      setIsGettingVariation(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/translation/style-variation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          japanese_text: japaneseText,
          current_translation: translation,
          variation_type: variationType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get style variation')
      }

      const data = await response.json()
      setTranslation(data.translation)
      setFeedback(data.explanation)
    } catch (error) {
      console.error('Error getting style variation:', error)
    } finally {
      setIsGettingVariation(false)
    }
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
              英訳サポート
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              英語翻訳
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              日本語を入力して、AIによる英訳を取得できます。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日本語
              </label>
              <Textarea
                value={japaneseText}
                onChange={(e) => setJapaneseText(e.target.value)}
                placeholder="翻訳したい日本語を入力してください"
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={getTranslation}
              disabled={isTranslating || !japaneseText.trim()}
              className="w-full"
            >
              {isTranslating ? '翻訳中...' : '翻訳する'}
            </Button>

            {translation && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    英訳
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    {translation}
                  </p>
                </div>

                {feedback && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                      解説
                    </h3>
                    <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {feedback}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => setIsSaveDialogOpen(true)}
                    variant="secondary"
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    復習問題として保存
                  </Button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => getStyleVariation("formal")}
                      disabled={isGettingVariation}
                      className="w-full"
                    >
                      フォーマルな表現を聞く
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => getStyleVariation("casual")}
                      disabled={isGettingVariation}
                      className="w-full"
                    >
                      カジュアルな表現を聞く
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>復習問題として保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">問題文</label>
              <Textarea
                value={japaneseText}
                onChange={(e) => setJapaneseText(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">解答</label>
              <Textarea
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={saveToReview}
              disabled={isSaving || !japaneseText.trim() || !translation.trim()}
            >
              {isSaving ? '保存中...' : '保存する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}