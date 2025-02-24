# app/routes/translation.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models.models import User
from ..routes.auth import get_current_user
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TranslationRequest(BaseModel):
    japanese_text: str

class TranslationResponse(BaseModel):
    translation: str
    explanation: str

@router.post("/generate", response_model=TranslationResponse)
async def generate_translation(
    request: TranslationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # AIによる英訳とその解説を取得
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                あなたは英語教師です。与えられた日本語を自然な英語に翻訳し、その解説を提供してください。
                解説には以下を含めてください：
                - 翻訳のポイント
                - 使用した表現の説明
                - 学習者が注意すべき点
                """},
                {"role": "user", "content": f"以下の日本語を英語に翻訳してください：「{request.japanese_text}」"}
            ]
        )
        
        # レスポンスを解析
        content = response.choices[0].message.content
        
        # 翻訳部分と解説部分を分離
        parts = content.split("\n\n", 1)
        translation = parts[0].replace("翻訳：", "").strip()
        
        # 解説部分（存在する場合）
        explanation = parts[1] if len(parts) > 1 else "解説は提供されませんでした。"
        
        return {
            "translation": translation,
            "explanation": explanation
        }
    
    except Exception as e:
        print(f"Error in generate_translation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))