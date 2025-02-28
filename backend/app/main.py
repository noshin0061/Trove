# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import question, auth, translation, review
from .database import engine
from .models import models
import logging


app = FastAPI()

# main.py

logging.basicConfig(level=logging.DEBUG)

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://trove-virid.vercel.app/"  # フロントエンドのドメインを追加
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# モデルのテーブルを作成
models.Base.metadata.create_all(bind=engine)

# ルーターの登録
app.include_router(auth.router, tags=["auth"])
app.include_router(
    question.router,
    prefix="/api/v1/questions",  # ここでプレフィックスを設定
)
app.include_router(translation.router, prefix="/api/v1/translation", tags=["translation"])  # 追加
app.include_router(
    review.router,
    prefix="/api/v1/review",
    tags=["review"]
)
