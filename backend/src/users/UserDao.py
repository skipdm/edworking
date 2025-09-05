from typing import Dict, List, Unpack, Any
import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..dao.base import BaseDAO
from ..users.models import User
from ..users.schemas import UserCreate
from passlib.context import CryptContext # импортируется pwd_context
from uuid import UUID

class UserDAO(BaseDAO[User]):
    model = User

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    @classmethod
    async def registration(cls, session: AsyncSession, user: UserCreate) -> User:
        # Проверка уникальности пользователя через пагинацию
        page_result = await cls.paginate(
            session=session,
            page=1,
            page_size=1,
            email=user.email,
            tg_id=user.tg_id
        )
        if page_result.total > 0:
            raise HTTPException(
                status_code=400,
                detail="Пользователь с такими данными уже существует"
            )
        password = cls.pwd_context.hash(user.password)

        user_data = user.dict(
            exclude_unset=True
        )
        user_data["id"] = uuid.uuid4()
        user_data["password"] = password

        new_user = await cls.create(
            session=session,
            **user_data
        )

        return new_user
    
    @classmethod
    async def get_all_users(
        cls,
        session: AsyncSession,
        **filters: Unpack[Dict[str, Any]]
    ) -> List[User]:
        """Получить всех пользователей (без пагинации)"""
        page_result = await cls.paginate(
            session=session,
            page=1,
            page_size=-1,  # -1 означает "все записи"
            **filters
        )
        return page_result.values
    
    @classmethod
    async def add_swipe(
        cls,
        session: AsyncSession,
        user_id: UUID,
        target_user_id: UUID,
        action: str
    ) -> tuple[bool, bool]:
        """
        Добавляет информацию о свайпе и проверяет на мэтч.
    
        Параметры:
            session - асинхронная сессия SQLAlchemy
            user_id - ID пользователя, который совершает свайп
            target_user_id - ID пользователя, которого свайпают
            action - тип действия ('like' или 'dislike')
    
        Возвращает:
            Кортеж (is_updated: bool, is_match: bool)
        """
        # Получаем текущего пользователя и целевого пользователя
        current_user = await cls.get(
            session=session, 
            id=user_id
        )
        target_user = await cls.get(
            session=session, 
            id=target_user_id
        )
        
        if not current_user or not target_user:
            raise ValueError("User not found")

        is_updated = False
        is_match = False
        target_id_str = str(target_user_id).lower()
        user_id_str = str(user_id).lower()

        if action.lower() == "like":
            liked_users = list(current_user.liked_users) if current_user.liked_users else []
            
            if target_id_str not in liked_users:
                liked_users.append(target_id_str)
                await cls.update(
                    session=session,
                    id=user_id,
                    liked_users=liked_users
                )
                is_updated = True

                target_liked = list(target_user.liked_users) if target_user.liked_users else []
                if user_id_str in target_liked:
                    current_matched = list(current_user.matched_users) if current_user.matched_users else []
                    target_matched = list(target_user.matched_users) if target_user.matched_users else []
                    
                    current_matched.append(target_id_str)
                    target_matched.append(user_id_str)
                    
                    await cls.update(
                        session=session,
                        id=user_id,
                        matched_users=current_matched
                    )
                    await cls.update(
                        session=session,
                        id=target_user_id,
                        matched_users=target_matched
                    )
                    is_match = True
    
        return (is_updated, is_match)
    