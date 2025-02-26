"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StyleVariationButtonsProps {
  japaneseText: string
  userAnswer: string
  onGetVariation: (variation: string) => void
  isLoading: boolean
}

export function StyleVariationButtons({
  japaneseText,
  userAnswer,
  onGetVariation,
  isLoading
}: StyleVariationButtonsProps) {
  const [customContext, setCustomContext] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleCustomSubmit = () => {
    if (customContext.trim()) {
      onGetVariation(`context:${customContext}`)
      setShowCustomInput(false)
      setCustomContext("")
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => onGetVariation("formal")}
          disabled={isLoading}
          className="w-full"
        >
          フォーマルな表現を聞く
        </Button>
        <Button
          variant="outline"
          onClick={() => onGetVariation("casual")}
          disabled={isLoading}
          className="w-full"
        >
          カジュアルな表現を聞く
        </Button>
      </div>

      {!showCustomInput ? (
        <Button
          variant="outline"
          onClick={() => setShowCustomInput(true)}
          disabled={isLoading}
          className="w-full"
        >
          シチュエーションを指定する
        </Button>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="例：ビジネスメール、友達とのLINE、学術論文など"
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCustomSubmit}
              disabled={isLoading || !customContext.trim()}
              className="w-full"
            >
              確認する
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomInput(false)
                setCustomContext("")
              }}
              className="w-full"
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 