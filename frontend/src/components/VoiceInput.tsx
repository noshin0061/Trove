'use client'

import React, { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  onResult: (text: string) => void
  language?: string
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onResult, 
  language = 'en-US' 
}) => {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 音声認識の開始
  const startListening = () => {
    setError(null);

    try {
      console.log("Starting speech recognition...");
      
      // クロスブラウザ対応のため、SpeechRecognition オブジェクトを取得
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError("このブラウザは音声入力に対応していません");
        return;
      }

      // Speech Recognition API のインスタンスを生成
      const recognition = new SpeechRecognition();
      
      // 基本設定
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // 結果が得られた時のイベントハンドラ
      recognition.onresult = (event) => {
        console.log("Speech recognition result received:", event);
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log("Final transcript:", finalTranscript);
          onResult(finalTranscript);
        }
      };
      
      // 各種エラーハンドラ
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`エラー: ${event.error}`);
        setIsListening(false);
      };
      
      // 認識終了時のハンドラ
      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };
      
      // 録音を開始
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setError("音声認識の開始に失敗しました");
    }
  };
  
  // 音声認識の停止
  const stopListening = () => {
    try {
      console.log("Stopping speech recognition...");
      
      // クロスブラウザ対応のため、SpeechRecognition オブジェクトを取得
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        return;
      }
      
      // Speech Recognition API のインスタンスを生成 (停止用)
      const recognition = new SpeechRecognition();
      recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  // 音声認識のサポートを確認
  const hasRecognitionSupport = typeof window !== 'undefined' && 
    (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined);

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
    );
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
      
      {isListening && (
        <span className="absolute left-0 -bottom-6 text-xs text-green-500 animate-pulse">
          話してください...
        </span>
      )}
      
      {error && (
        <span className="absolute left-0 -bottom-6 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}