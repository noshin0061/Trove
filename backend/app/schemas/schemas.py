# app/schemas/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Question関連のスキーマ
class QuestionBase(BaseModel):
    japanese_text: str
    difficulty_level: Optional[int] = 1

class QuestionCreate(BaseModel):
    japanese_text: str
    difficulty_level: Optional[int] = 1

class QuestionResponse(BaseModel):
    id: int
    japanese_text: str
    english_text: Optional[str] = None
    difficulty_level: int
    created_at: datetime

    class Config:
        from_attributes = True

# Answer関連のスキーマ
class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str
    is_voice: Optional[bool] = False

class AnswerResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    user_answer: str
    is_correct: Optional[bool]
    feedback: Optional[str]
    answered_at: datetime

    class Config:
        from_attributes = True

# お気に入り関連のスキーマ
class FavoriteCreate(BaseModel):
    user_id: int
    question_id: int

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    created_at: datetime

    class Config:
        from_attributes = True