from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from ..dao.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
        index=True
    )
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    tg_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=False)
    city = Column(String, nullable=False)
    about = Column(String, nullable=True)
    liked_users = Column(JSONB, nullable=False, default=list)
    matched_users = Column(JSONB, nullable=False, default=list)
    posts = relationship(
        "Post", 
        back_populates="author",
        cascade="all, delete-orphan",  # автоматическое удаление постов при удалении пользователя
        lazy="selectin"
    )
