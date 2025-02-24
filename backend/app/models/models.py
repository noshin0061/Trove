# app/models/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # リレーションシップの定義を修正
    favorite_questions = relationship("FavoriteQuestion", back_populates="user", cascade="all, delete-orphan")
    answers = relationship("UserAnswer", back_populates="user", cascade="all, delete-orphan")
    mistake_words = relationship("MistakeWord", back_populates="user", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    japanese_text = Column(String)
    english_text = Column(String)
    difficulty_level = Column(Integer)

    # リレーションシップを更新
    answers = relationship("UserAnswer", back_populates="question", cascade="all, delete-orphan")
    favorites = relationship("FavoriteQuestion", back_populates="question", cascade="all, delete-orphan")

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(String)
    feedback = Column(String)

    # リレーションシップを追加
    user = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="answers")

class MistakeWord(Base):
    __tablename__ = "mistake_words"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    word = Column(String)
    count = Column(Integer, default=1)

    # リレーションシップを追加
    user = relationship("User", back_populates="mistake_words")

class FavoriteQuestion(Base):
    __tablename__ = "favorite_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    japanese_text = Column(String)
    english_answer = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # リレーションシップを修正
    user = relationship("User", back_populates="favorite_questions")
    question = relationship("Question", back_populates="favorites")