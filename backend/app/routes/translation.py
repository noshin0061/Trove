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
import re

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TranslationRequest(BaseModel):
    japanese_text: str

class TranslationResponse(BaseModel):
    translation: str
    explanation: str

class StyleVariationRequest(BaseModel):
    japanese_text: str
    current_translation: str
    variation_type: str

@router.post("/generate")
async def generate_translation(
    request: TranslationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                あなたは英語教師です。以下の形式で回答してください：

                英訳：[英訳を記載]

                解説：
                - 使用している文法のポイント
                - 重要な語彙や表現の説明
                - 翻訳の際の注意点
                """},
                {"role": "user", "content": f"以下の日本語を英語に翻訳してください：\n\n{request.japanese_text}"}
            ]
        )
        
        full_response = response.choices[0].message.content
        
        # 英訳と解説を分離
        translation_match = re.search(r'英訳[：:](.*?)(?=\n\n解説[：:]|\Z)', full_response, re.DOTALL)
        explanation_match = re.search(r'解説[：:](.*)', full_response, re.DOTALL)
        
        translation = translation_match.group(1).strip() if translation_match else ""
        explanation = explanation_match.group(1).strip() if explanation_match else ""
        
        return {
            "translation": translation,
            "explanation": explanation
        }
        
    except Exception as e:
        print(f"Error in generate_translation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/style-variation")
async def get_style_variation(
    request: StyleVariationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        variation_type = request.variation_type
        style = "フォーマル" if variation_type == "formal" else "カジュアル"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"""
                あなたは英語教師です。以下の日本語を{style}な英語表現に翻訳してください。
                以下の形式で回答してください：

                英訳：[{style}な英訳を記載]

                解説：
                - なぜこの表現が{style}な場面に適しているのか
                - 使用している表現や語彙のポイント
                - 場面に応じた言い回しの違いについて
                """},
                {"role": "user", "content": f"日本語: {request.japanese_text}\n現在の英訳: {request.current_translation}"}
            ]
        )
        
        full_response = response.choices[0].message.content
        
        # 英訳と解説を分離
        translation_match = re.search(r'英訳[：:](.*?)(?=\n\n解説[：:]|\Z)', full_response, re.DOTALL)
        explanation_match = re.search(r'解説[：:](.*)', full_response, re.DOTALL)
        
        translation = translation_match.group(1).strip() if translation_match else ""
        explanation = explanation_match.group(1).strip() if explanation_match else ""
        
        return {
            "translation": translation,
            "explanation": explanation
        }
        
    except Exception as e:
        print(f"Error in get_style_variation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))