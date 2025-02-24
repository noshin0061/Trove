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

export default function TranslationSupportPage() {
  const { isAuthenticated, isLoading, getAuthHeader } = useAuth()
  const router = useRouter()
  const [japaneseText, setJapaneseText] = useState('')
  const [translation, setTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  // AIによる英訳を取得
  const getTranslation = async () => {
    if (!japaneseText.trim()) return
    
    try {
      setIsTranslating(true)
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
        throw new Error('Failed to translate')
      }

      const data = await response.json()
      setTranslation(data.translation)
      setExplanation(data.explanation)
    } catch (error) {
      console.error('Error getting translation:', error)
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
      setExplanation('')
      
      // 成功メッセージ（オプション）
      alert('復習問題として保存しました')
    } catch (error) {
      console.error('Error saving translation:', error)
    } finally {
      setIsSaving(false)
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
          <div className="space-y-4">
            <label 
              htmlFor="japanese-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              日本語を入力
            </label>
            <Textarea
              id="japanese-input"
              value={japaneseText}
              onChange={(e) => setJapaneseText(e.target.value)}
              placeholder="英訳したい日本語を入力してください"
              className="h-32"
            />
          </div>

          <Button
            onClick={getTranslation}
            disabled={isTranslating || !japaneseText.trim()}
            className="w-full"
          >
            {isTranslating ? '翻訳中...' : 'AIに英訳してもらう'}
          </Button>

          {translation && (
            <>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  英訳
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {translation}
                </p>
              </div>

              {explanation && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">
                    解説
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {explanation}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setIsSaveDialogOpen(true)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>復習問題として保存</span>
              </Button>
            </>
          )}
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