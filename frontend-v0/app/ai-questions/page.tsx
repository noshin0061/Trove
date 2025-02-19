"use client"

import { useState } from "react"

export default function AIQuestions() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const generateQuestion = () => {
    // ここでAI APIを呼び出して問題を生成します
    // 実際の実装はバックエンドで行います
    setQuestion("次の日本語を英語に訳してください：「宇宙は無限の可能性に満ちている」")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-space-100">AI英語問題</h1>
      <button
        onClick={generateQuestion}
        className="bg-space-600 hover:bg-space-700 text-white font-bold py-2 px-4 rounded"
      >
        新しい問題を生成
      </button>
      {question && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-xl text-space-200">{question}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full mt-4 p-2 bg-gray-700 text-white rounded"
            rows={4}
            placeholder="ここに回答を入力してください"
          />
          <button className="mt-4 bg-space-600 hover:bg-space-700 text-white font-bold py-2 px-4 rounded">
            回答を送信
          </button>
        </div>
      )}
    </div>
  )
}


