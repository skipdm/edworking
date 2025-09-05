from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from uuid import UUID
from typing import List

from src.posts.schemas import PostResponse, PostUpdate, PostBase
from src.posts.dao import PostDAO
from src.dao.database import get_db
from src.users.router import get_current_user
from src.users.models import User

router_post = APIRouter()

@router_post.post("/create_post", response_model=PostResponse)
async def create_new_post(
    user: User = Depends(get_current_user),
    post_data: PostBase = Depends(),
    session: AsyncSession = Depends(get_db)
) -> PostResponse:
    new_post = await PostDAO.create_post(
        session=session,
        post_data=post_data,
        user_id=user.id,
    )
    """Создание нового поста"""
    return PostResponse(
        id=new_post.id,
        user_id=new_post.user_id,
        title=new_post.title,
        content=new_post.content,
        created_at=new_post.created_at
    )

@router_post.get("/get_post/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: UUID,
    session: AsyncSession = Depends(get_db)
):
    """Получение конкретного поста по ID"""
    post = await PostDAO.get_post(session, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post

@router_post.get("/user/me", response_model=List[PostResponse])
async def get_my_posts(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Получение всех постов текущего пользователя"""
    return await PostDAO.get_user_posts(session=session, user_id=user.id)

@router_post.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_posts(
    user_id: uuid.UUID,
    session: AsyncSession = Depends(get_db)
):
    """Получение всех постов указанного пользователя"""
    return await PostDAO.get_user_posts(session, user_id)

@router_post.put("/post_update/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: UUID,
    post_data: PostUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Обновление поста"""
    updated_post = await PostDAO.update_post(
        session=session,
        post_id=post_id,
        user_id=user.id,
        update_data=post_data
    )
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or access denied"
        )
    return updated_post

@router_post.delete("/post_delete/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Удаление поста"""
    if not await PostDAO.delete_post(session=session, post_id=post_id, user_id=user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or access denied"
        )