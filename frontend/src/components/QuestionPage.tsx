// components/QuestionPage.tsx

'use client'

import { useState, useEffect } from 'react'
import { Question, QuestionResponse, AnswerResponse, FavoriteResponse } from '@/types'
import { Mic, Star, StarOff } from 'lucide-react'

export default function QuestionPage() {
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    generateNewQuestion()
  }, [])

  const generateNewQuestion = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 }) // TODO: 実際のユーザーID
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate question')
      }
      
      const data: QuestionResponse = await response.json()
      setQuestion({
        id: data.id,
        japanese_text: data.japanese_text,
      })
      setAnswer('')
      setFeedback('')
    } catch (error) {
      console.error('Error generating question:', error)
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // TODO: 音声認識の実装
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
    }
  }

  const submitAnswer = async () => {
    if (!question) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          answer_text: answer,
          is_voice: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data: AnswerResponse = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!question) return

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${question.id}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 1 }) // TODO: 実際のユーザーID
    })
    const data = await response.json()
    setIsFavorite(data.is_favorite)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">問題</h2>
          <button
            onClick={toggleFavorite}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            {isFavorite ? <Star className="text-yellow-400" /> : <StarOff />}
          </button>
        </div>
        <p className="text-lg p-4 bg-gray-50 rounded-lg">
          {question?.japanese_text}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="英語で回答してください"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={startVoiceRecording}
            className={`p-2 rounded ${
              isRecording ? 'bg-red-500' : 'bg-blue-500'
            } text-white`}
          >
            <Mic />
          </button>
        </div>
        <button
          onClick={submitAnswer}
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          回答を確認
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">フィードバック</h3>
          <p>{feedback}</p>
        </div>
      )}

      <button
        onClick={generateNewQuestion}
        className="mt-8 w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        次の問題へ
      </button>
    </div>
  )
}