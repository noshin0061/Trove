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

@router.post("/generate")
async def generate_translation(
    request: TranslationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # AIによる翻訳と解説
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                あなたは英語教師です。日本語を英語に翻訳し、その翻訳に関する解説を日本語で提供してください。
                解説には以下の点を含めてください：
                - 使用している文法のポイント
                - 重要な語彙や表現の説明
                - 翻訳の際の注意点
                """},
                {"role": "user", "content": f"以下の日本語を英語に翻訳し、解説を付けてください：\n\n{request.japanese_text}"}
            ]
        )
        
        # レスポンスから翻訳と解説を抽出
        full_response = response.choices[0].message.content
        
        # 翻訳と解説を分離するロジック
        translation_lines = []
        explanation_lines = []
        is_explanation = False
        
        for line in full_response.split('\n'):
            if line.strip() == '':
                is_explanation = True
                continue
            if not is_explanation:
                translation_lines.append(line)
            else:
                explanation_lines.append(line)
        
        translation = '\n'.join(translation_lines).strip()
        explanation = '\n'.join(explanation_lines).strip()
        
        return {
            "translation": translation,
            "explanation": explanation
        }
        
    except Exception as e:
        print(f"Error in generate_translation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))