# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import question, auth
from .database import engine
from .models import models

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# モデルのテーブルを作成
models.Base.metadata.create_all(bind=engine)

# ルーターの登録
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(question.router, prefix="/api/v1", tags=["questions"])
