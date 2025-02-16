-- 問題テーブル
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    japanese_text TEXT NOT NULL,
    english_text TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーの回答履歴
CREATE TABLE IF NOT EXISTS user_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    question_id INTEGER REFERENCES questions(id),
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    feedback TEXT,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 間違えた単語のテーブル
CREATE TABLE IF NOT EXISTS mistake_words (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word TEXT NOT NULL,
    context TEXT,
    count INTEGER DEFAULT 1,
    last_mistake_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- お気に入り問題
CREATE TABLE IF NOT EXISTS favorite_questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    question_id INTEGER REFERENCES questions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id)
);

-- ユーザーデータベース
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);