// hooks/useSpeechRecognition.ts
import { useState, useEffect, useCallback } from 'react'

interface UseSpeechRecognitionProps {
  onResult: (text: string) => void
  onError?: (error: string) => void
  language?: string
}

export const useSpeechRecognition = ({
  onResult,
  onError,
  language = 'en-US'
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = language

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const text = event.results[0][0].transcript
          onResult(text)
          setIsListening(false)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          onError?.(event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognition)
      }
    }
  }, [language, onResult, onError])

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        onError?.(error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }, [recognition, onError])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition])

  return {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognition
  }
}
