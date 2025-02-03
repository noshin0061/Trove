"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [word, setWord] = useState("")
  const [example, setExample] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateExample = async () => {
    if (!word) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/examples/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
      })
      
      if (!response.ok) throw new Error("Failed to generate example")
      
      const data = await response.json()
      setExample(data.sentence)
    } catch (error) {
      console.error("Error:", error)
      setExample("Failed to generate example sentence")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="border-b dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            English Learning Assistant
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="word-input" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enter an English word
            </label>
            <input
              id="word-input"
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Type a word here..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          <button
            onClick={generateExample}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white
                     bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                     disabled:bg-gray-300 dark:disabled:bg-gray-700
                     disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Generating..." : "Generate Example"}
          </button>
          
          {example && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700
                          bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Example Sentence:
              </h2>
              <p className="text-gray-700 dark:text-gray-300">{example}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
