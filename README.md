# Trove

## 概要
Troveは、AIを活用した英語学習アプリケーションです。ユーザーが日本語を英語に翻訳する練習をサポートし、AIによる詳細なフィードバックを提供します。

## 主な機能
- 🎯 AIによる英語翻訳問題の自動生成
- 🎤 音声認識による英語入力
- ✍️ AIによる添削とフィードバック
- 📝 お気に入り問題の保存と復習
- 🔄 フォーマル/カジュアルなど、文体のバリエーション提案

## 技術スタック
### バックエンド
- FastAPI
- PostgreSQL
- SQLAlchemy
- OpenAI API (GPT-3.5-turbo)
- JWT認証

### フロントエンド
- Next.js
- TypeScript
- Web Speech API
- TailwindCSS

## 環境構築

### 必要条件
- Python 3.8+
- Node.js 16+
- PostgreSQL

### 環境変数の設定
```
env
DATABASE_URL=postgresql://username@localhost/H2M
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```
### バックエンド起動
```
bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### フロントエンド起動
```
bash
cd frontend
npm install
npm run dev
```

## API エンドポイント
- `/api/v1/questions` - 問題生成・添削
- `/api/v1/translation` - 翻訳支援
- `/api/v1/review` - 復習機能
- `/api/v1/auth` - 認証関連

## 特徴的な実装

### AIによる問題生成と添削
- OpenAI APIを活用した問題生成
- 詳細なフィードバックシステム