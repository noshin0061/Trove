from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from ..database import get_db
from ..models.models import Question, UserAnswer, FavoriteQuestion, User
from ..routes.auth import get_current_user
import os
from openai import OpenAI

router = APIRouter()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class ReviewAnswerRequest(BaseModel):
    favorite_question_id: int
    answer_text: str

@router.post("/check")
async def check_review_answer(
    request: ReviewAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # お気に入りの問題を取得
        favorite_question = db.query(FavoriteQuestion).filter(
            FavoriteQuestion.id == request.favorite_question_id,
            FavoriteQuestion.user_id == current_user.id  # ユーザーの問題であることを確認
        ).first()
        
        if not favorite_question:
            raise HTTPException(status_code=404, detail="Favorite question not found")

        # AIによる添削（日本語フィードバック）
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                あなたは英語教師です。学習者の英訳を添削し、日本語でフィードバックを提供してください。
                フィードバックには以下を箇条書き形式で含めてください：
                - 改善点
                - 正確な答え(全文を出す)
                - 文法や語彙の解説
                """},
                {"role": "user", "content": f"以下の英訳を添削してください。\n\n元の日本語: {favorite_question.japanese_text}\n学習者の英訳: {request.answer_text}"}
            ]
        )
        
        feedback = response.choices[0].message.content
        
        # 回答を保存
        user_answer = UserAnswer(
            user_id=current_user.id,
            question_id=favorite_question.question_id,  # 元の問題IDを保存
            favorite_question_id=favorite_question.id,  # お気に入り問題IDも保存
            user_answer=request.answer_text,
            feedback=feedback
        )
        db.add(user_answer)
        db.commit()
        
        return {"feedback": feedback}
    except Exception as e:
        print(f"Error in check_review_answer: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))