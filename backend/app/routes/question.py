# app/routes/question.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel  # 正しいインポート
from datetime import datetime
from ..database import get_db
from ..models.models import Question, UserAnswer, MistakeWord, FavoriteQuestion, User
from ..routes.auth import get_current_user  # authからインポート
import os
from openai import OpenAI
import random
from dotenv import load_dotenv
from typing import List


load_dotenv()

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# リクエストモデルの定義をルートハンドラーの前に配置
class AnswerRequest(BaseModel):
    question_id: int
    answer_text: str

class SaveFavoriteRequest(BaseModel):
    question_id: int | None = None  # オプショナルなのでデフォルト値をNoneに設定
    japanese_text: str
    english_answer: str

class FavoriteQuestionResponse(BaseModel):
    id: int
    japanese_text: str
    english_answer: str
    created_at: datetime

@router.post("/generate")
async def generate_question(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 認証の依存関係
):
    try:
        # 間違えた単語があるか確認
        mistake_words = db.query(MistakeWord).filter(
            MistakeWord.user_id == current_user.id
        ).order_by(MistakeWord.count.desc()).limit(5).all()
        
        if mistake_words:
            # 間違えた単語を含む問題を生成
            word = random.choice(mistake_words).word
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Generate a Japanese sentence that includes the specified English word."},
                    {"role": "user", "content": f"Create a natural Japanese sentence that would use the English word '{word}'"}
                ]
            )
            japanese_text = response.choices[0].message.content
        else:
            # ランダムな問題を生成
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Generate a natural Japanese sentence for English translation practice."},
                    {"role": "user", "content": "Create a natural Japanese sentence for business or daily life situations."}
                ]
            )
            japanese_text = response.choices[0].message.content
        
        # 問題をデータベースに保存
        question = Question(
            japanese_text=japanese_text,
            english_text="",  # 空文字列を設定
            difficulty_level=1
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        
        return {
            "id": question.id,
            "japanese_text": japanese_text
        }
    except Exception as e:
        print(f"Error in generate_question: {str(e)}")  # エラーログを追加
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class AnswerRequest(BaseModel):
    question_id: int
    answer_text: str

@router.post("/check")
async def check_answer(
    request: AnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        question = db.query(Question).filter(Question.id == request.question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # AIによる添削
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an English teacher. Review the English translation and provide feedback."},
                {"role": "user", "content": f"Review this English translation. Original Japanese: {question.japanese_text}\nStudent's translation: {request.answer_text}"}
            ]
        )
        
        feedback = response.choices[0].message.content
        
        # 回答を保存
        user_answer = UserAnswer(
            user_id=current_user.id,
            question_id=request.question_id,
            user_answer=request.answer_text,
            feedback=feedback
        )
        db.add(user_answer)
        db.commit()
        
        return {"feedback": feedback}
    except Exception as e:
        print(f"Error in check_answer: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{question_id}/favorite")
async def toggle_favorite(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        existing = db.query(FavoriteQuestion).filter(
            FavoriteQuestion.user_id == current_user.id,
            FavoriteQuestion.question_id == question_id
        ).first()
        
        if existing:
            db.delete(existing)
            is_favorite = False
        else:
            favorite = FavoriteQuestion(
                user_id=current_user.id,
                question_id=question_id
            )
            db.add(favorite)
            is_favorite = True
        
        db.commit()
        return {"is_favorite": is_favorite}
    except Exception as e:
        print(f"Error in toggle_favorite: {str(e)}")  # エラーログを追加
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 既存のルーターに新しいエンドポイントを追加
@router.post("/save-favorite")
async def save_favorite_question(
    request: SaveFavoriteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 新しい問題を作成または既存の問題を更新
        if request.question_id:
            question = db.query(Question).filter(Question.id == request.question_id).first()
            if question:
                question.japanese_text = request.japanese_text
                question.english_text = request.english_answer
            else:
                question = Question(
                    japanese_text=request.japanese_text,
                    english_text=request.english_answer,
                    difficulty_level=1
                )
                db.add(question)
        else:
            question = Question(
                japanese_text=request.japanese_text,
                english_text=request.english_answer,
                difficulty_level=1
            )
            db.add(question)
        
        db.commit()
        db.refresh(question)

        # お気に入りとして保存
        favorite = FavoriteQuestion(
            user_id=current_user.id,
            question_id=question.id,
            japanese_text=request.japanese_text,
            english_answer=request.english_answer,
            created_at=datetime.utcnow()  # 明示的に設定
        )
        db.add(favorite)
        db.commit()

        return {
            "success": True,
            "question_id": question.id,
            "message": "Question saved successfully"
        }
    except Exception as e:
        print(f"Error in save_favorite_question: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/favorites", response_model=List[FavoriteQuestionResponse])
async def get_favorite_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        favorites = db.query(FavoriteQuestion).filter(
            FavoriteQuestion.user_id == current_user.id
        ).order_by(FavoriteQuestion.created_at.desc()).all()
        
        return [{
            "id": fav.id,
            "japanese_text": fav.japanese_text,
            "english_answer": fav.english_answer,
            "created_at": fav.created_at
        } for fav in favorites]
    except Exception as e:
        print(f"Error fetching favorite questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))