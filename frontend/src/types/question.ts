// src/types/question.d.ts

interface Question {
    id: number;
    japanese_text: string;
    english_text?: string;
    difficulty_level?: number;
    created_at?: string;
  }
  
  interface QuestionResponse {
    id: number;
    japanese_text: string;
  }
  
  interface AnswerResponse {
    feedback: string;
  }
  
  interface FavoriteResponse {
    is_favorite: boolean;
  }