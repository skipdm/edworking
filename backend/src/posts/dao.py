import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from ..dao.base import BaseDAO
from .models import Post
from .schemas import PostUpdate, PostBase


class PostDAO(BaseDAO[Post]):
    model = Post

    @classmethod
    async def create_post(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        post_data: PostBase
    ) -> Post:
        post_dict = post_data.dict(exclude_unset=True)
        post_dict["id"] = uuid.uuid4()
        post_dict["user_id"] = user_id

        new_post = await cls.create(
            session=session,
            **post_dict
        )
        return new_post

    @classmethod
    async def get_post(
        cls,
        session: AsyncSession,
        post_id: uuid.UUID
    ) -> Optional[Post]:
        result = await session.execute(
            select(cls.model).where(cls.model.id == post_id)
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_user_posts(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID
    ) -> list[Post]:
        result = await session.execute(
            select(cls.model)
            .where(cls.model.user_id == user_id)
            .order_by(cls.model.created_at.desc())
        )
        return result.scalars().all()

    @classmethod
    async def update_post(
        cls,
        session: AsyncSession,
        post_id: uuid.UUID,
        user_id: uuid.UUID,
        update_data: PostUpdate
    ) -> Optional[Post]:
        # Проверяем существование поста и принадлежность пользователю
        existing_post = await cls.get_post(session, post_id)
        if not existing_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        if existing_post.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own posts"
            )

        update_values = update_data.dict(exclude_unset=True)
        await session.execute(
            update(cls.model)
            .where(cls.model.id == post_id)
            .values(**update_values)
        )
        # Получаем обновленный пост
        return await cls.get_post(session, post_id)

    @classmethod
    async def delete_post(
        cls,
        session: AsyncSession,
        post_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        # Проверяем существование поста и принадлежность пользователю
        existing_post = await cls.get_post(session, post_id)
        if not existing_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        if existing_post.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own posts"
            )

        await session.execute(
            delete(cls.model)
            .where(cls.model.id == post_id)
        )
        await session.commit()
        return True