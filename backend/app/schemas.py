# backend/app/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExampleBase(BaseModel):
    word: str
    
class ExampleCreate(ExampleBase):
    pass

class Example(ExampleBase):
    id: int
    sentence: str
    created_at: datetime

    class Config:
        from_attributes = True