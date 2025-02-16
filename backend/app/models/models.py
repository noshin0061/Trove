# app/models/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base  # ..を使って一つ上の階層のdatabase.pyを参照

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    japanese_text = Column(Text, nullable=False)
    english_text = Column(Text)
    difficulty_level = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean)
    feedback = Column(Text)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

class MistakeWord(Base):
    __tablename__ = "mistake_words"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    word = Column(String, nullable=False)
    context = Column(Text)
    count = Column(Integer, default=1)
    last_mistake_at = Column(DateTime(timezone=True), server_default=func.now())

class FavoriteQuestion(Base):
    __tablename__ = "favorite_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())    