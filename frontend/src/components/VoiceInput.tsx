'use client'

import React, { useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface VoiceInputProps {
  onResult: (text: string) => void
  language?: string
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onResult, 
  language = 'en-US' 
}) => {
  const [error, setError] = useState<string | null>(null)
  const {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport
  } = useSpeechRecognition({
    onResult,
    onError: (error: string) => {
      setError(error)
      console.error('Speech recognition error:', error)
    },
    language
  })

  if (!hasRecognitionSupport) {
    return (
      <div className="relative">
        <button
          disabled
          className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed"
          title="音声入力は利用できません"
        >
          <MicOff size={20} />
        </button>
        <span className="absolute left-0 -bottom-6 text-xs text-red-500">
          お使いのブラウザは音声入力に対応していません
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-lg transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        title={isListening ? '音声入力を停止' : '音声入力を開始'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      {error && (
        <span className="absolute left-0 -bottom-6 text-xs text-red-500">
          {error === 'network' ? 'ネットワークエラーが発生しました' : error}
        </span>
      )}
    </div>
  )
}