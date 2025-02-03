# backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class Example(Base):
    __tablename__ = "examples"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, index=True)
    sentence = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())