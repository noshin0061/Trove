"use client"

import { useState } from "react"

export default function Vocabulary() {
  const [word, setWord] = useState("")
  const [meaning, setMeaning] = useState("")
  const [vocabulary, setVocabulary] = useState<Array<{ word: string; meaning: string }>>([])

  const addWord = () => {
    if (word && meaning) {
      setVocabulary([...vocabulary, { word, meaning }])
      setWord("")
      setMeaning("")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-space-100">単語・フレーズ登録</h1>
      <div className="space-y-4">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="単語またはフレーズ"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="意味"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
        <button onClick={addWord} className="bg-space-600 hover:bg-space-700 text-white font-bold py-2 px-4 rounded">
          追加
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-space-200">登録済み単語・フレーズ</h2>
        <ul className="space-y-2">
          {vocabulary.map((item, index) => (
            <li key={index} className="bg-gray-700 p-2 rounded">
              <span className="font-bold">{item.word}</span>: {item.meaning}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


