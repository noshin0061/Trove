from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas
from .database import engine, get_db
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

# データベーステーブルの作成
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI クライアントの初期化（最新バージョン用）
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=None  # デフォルトのHTTPクライアントを使用
)

@app.post("/examples/", response_model=schemas.Example)
async def create_example(example: schemas.ExampleCreate, db: Session = Depends(get_db)):
    try:
        # 既存の例文をチェック
        db_example = db.query(models.Example).filter(models.Example.word == example.word).first()
        if db_example:
            return db_example
            
        # OpenAI APIで例文を生成（最新バージョン用）
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Generate a simple example sentence for English learners."},
                {"role": "user", "content": f"Create a natural example sentence using the word '{example.word}'"}
            ]
        )
        
        sentence = response.choices[0].message.content
        
        # 新しい例文を作成
        db_example = models.Example(word=example.word, sentence=sentence)
        db.add(db_example)
        db.commit()
        db.refresh(db_example)
        return db_example

    except Exception as e:
        print(f"Error: {e}")  # サーバーサイドでエラーをログ
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/examples/{word}", response_model=schemas.Example)
def read_example(word: str, db: Session = Depends(get_db)):
    db_example = db.query(models.Example).filter(models.Example.word == word).first()
    if db_example is None:
        raise HTTPException(status_code=404, detail="Word not found")
    return db_example