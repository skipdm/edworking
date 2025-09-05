from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class PostBase(BaseModel):
    content: str

class PostUpdate(BaseModel):
    content: Optional[str] = None

class PostResponse(PostBase):
    id: UUID
    user_id: UUID
    created_at: datetime
