// components/SaveQuestionDialog.tsx
'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface SaveQuestionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (japaneseText: string, englishAnswer: string) => void
  initialJapanese: string
  initialEnglish: string
}

export function SaveQuestionDialog({
  isOpen,
  onClose,
  onSave,
  initialJapanese,
  initialEnglish
}: SaveQuestionDialogProps) {
  const [japaneseText, setJapaneseText] = useState(initialJapanese)
  const [englishAnswer, setEnglishAnswer] = useState(initialEnglish)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">問題を保存</h2>
        {isEditing ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">問題文</label>
                <Textarea
                  value={japaneseText}
                  onChange={(e) => setJapaneseText(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">解答</label>
                <Textarea
                  value={englishAnswer}
                  onChange={(e) => setEnglishAnswer(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">問題文:</h3>
              <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded">{japaneseText}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">解答:</h3>
              <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded">{englishAnswer}</p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'プレビュー' : '編集する'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            キャンセル
          </Button>
          <Button
            onClick={() => onSave(japaneseText, englishAnswer)}
          >
            保存する
          </Button>
        </div>
      </div>
    </Dialog>
  )
}