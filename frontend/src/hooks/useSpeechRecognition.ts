'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionOptions {
  onResult: (text: string) => void
  onError?: (error: string) => void
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

// TypeScriptエラーを避けるための基本的なイベント型
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultItem {
  [index: number]: SpeechRecognitionResult;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResultItem;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError {
  error: string;
  message: string;
}

// TypeScriptのための型拡張
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeechRecognition({
  onResult,
  onError,
  language = 'en-US',
  continuous = true,
  interimResults = true
}: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false)
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)
  const recognitionRef = useRef<any>(null)
  
  // デバッグログを有効化
  const debug = true;
  const log = (...args: unknown[]) => {
    if (debug) console.log('🎤 [SpeechRecognition]:', ...args);
  };
  const logError = (...args: any[]) => {
    if (debug) console.error('🎤 [SpeechRecognition ERROR]:', ...args);
  };

  // SpeechRecognition APIの初期化と確認
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window === 'undefined') return;
      log('Checking for SpeechRecognition support...');
      
      // ブラウザー間の互換性のためのチェック - TypeScript互換
      const SpeechRecognitionAPI = 
        window.SpeechRecognition || 
        window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        setHasRecognitionSupport(true);
        log('SpeechRecognition API is supported!');
      } else {
        setHasRecognitionSupport(false);
        logError('SpeechRecognition API is not supported in this browser');
      }
    };
    
    checkSupport();
  }, [log, logError]);

  // SpeechRecognition インスタンスの初期化
  const initializeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // SpeechRecognition APIのブラウザー実装を取得 - TypeScript互換
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      logError('Failed to initialize: SpeechRecognition API not available');
      return null;
    }

    try {
      log('Initializing SpeechRecognition instance...');
      const recognition = new SpeechRecognitionAPI();
      
      // 基本設定
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      
      // イベントハンドラを設定
      
      // 認識結果のハンドリング
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        log('Recognition result received:', event);
        
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            log(`Final transcript: "${finalTranscript}"`);
          } else {
            log(`Interim transcript: "${transcript}"`);
          }
        }
        
        if (finalTranscript) {
          onResult(finalTranscript);
        }
      };
      
      // エラーハンドリング
      recognition.onerror = (event: SpeechRecognitionError) => {
        logError('Recognition error:', event.error, event);
        
        if (onError) {
          onError(event.error);
        }
        
        // マイク許可エラーなどの場合は停止
        if (['not-allowed', 'service-not-allowed'].includes(event.error)) {
          setIsListening(false);
        }
      };
      
      // 終了ハンドリング
      recognition.onend = () => {
        log('Recognition ended');
        setIsListening(false);
      };
      
      // 開始・音声検出のハンドリング
      recognition.onstart = () => log('Recognition started');
      recognition.onaudiostart = () => log('Audio capturing started');
      recognition.onaudioend = () => log('Audio capturing ended');
      recognition.onspeechstart = () => log('Speech detected');
      recognition.onspeechend = () => log('Speech ended');
      
      return recognition;
    } catch (error) {
      logError('Error initializing SpeechRecognition:', error);
      return null;
    }
  }, [language, continuous, interimResults, onResult, onError]);

  // 音声認識開始
  const startListening = useCallback(() => {
    log('Attempting to start listening...');
    
    if (!recognitionRef.current) {
      log('Creating new recognition instance...');
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current) {
      try {
        log('Starting recognition...');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        logError('Failed to start recognition:', error);
        
        // DOMExceptionが発生した場合（既に実行中など）、インスタンスをリセット
        if (error instanceof DOMException) {
          log('DOMException occurred. Resetting recognition instance...');
          try {
            recognitionRef.current.abort();
          } catch (e) {
            logError('Error aborting recognition:', e);
          }
          
          setTimeout(() => {
            recognitionRef.current = initializeRecognition();
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
              }
            } catch (e) {
              logError('Error restarting recognition:', e);
              if (onError) onError('failed-to-restart');
            }
          }, 100);
        } else {
          if (onError) onError('failed-to-start');
        }
      }
    } else {
      logError('Cannot start: Recognition instance is not available');
      if (onError) onError('not-available');
    }
  }, [initializeRecognition, onError]);

  // 音声認識停止
  const stopListening = useCallback(() => {
    log('Attempting to stop listening...');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        log('Recognition stopped');
      } catch (error) {
        logError('Error stopping recognition:', error);
        try {
          recognitionRef.current.abort();
          log('Recognition aborted');
        } catch (e) {
          logError('Error aborting recognition:', e);
        }
      } finally {
        setIsListening(false);
      }
    } else {
      log('Cannot stop: Recognition instance is not available');
      setIsListening(false);
    }
  }, []);

  // 言語が変更された場合、新しいインスタンスを作成
  useEffect(() => {
    if (recognitionRef.current) {
      log('Language changed, recreating recognition instance');
      const wasListening = isListening;
      
      if (wasListening) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          logError('Error stopping recognition before recreating:', error);
        }
      }
      
      recognitionRef.current = initializeRecognition();
      
      if (wasListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          logError('Error restarting recognition after recreating:', error);
          setIsListening(false);
        }
      }
    }
  }, [language, initializeRecognition, isListening]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        log('Cleaning up: stopping recognition');
        try {
          recognitionRef.current.stop();
        } catch (error) {
          logError('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport
  };
}