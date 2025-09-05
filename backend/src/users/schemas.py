from pydantic import EmailStr
from pydantic import BaseModel
from datetime import date
from typing import Optional
import uuid
from uuid import UUID
from enum import Enum

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    tg_id: str
    name: str
    birth_date: date
    city: str
    about: Optional[str] = None

class UserLogin(BaseModel):
    tg_id: str
    password: str

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    tg_id: str
    birth_date: date
    city: str
    about: Optional[str] = None
    # Другие поля

class SwipeAction(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"

class SwipeCreate(BaseModel):
    target_user_id: UUID
    action: SwipeAction
