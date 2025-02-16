// src/types/index.ts

export type Question = {
    id: number;
    japanese_text: string;
    english_text?: string;
    difficulty_level?: number;
    created_at?: string;
  }
  
  export type QuestionResponse = {
    id: number;
    japanese_text: string;
  }
  
  export type AnswerResponse = {
    feedback: string;
  }
  
  export type FavoriteResponse = {
    is_favorite: boolean;
  }