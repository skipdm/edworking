from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession  # Используем асинхронную сессию
from src.users.schemas import UserCreate, UserLogin, UserProfileResponse, SwipeCreate
from src.dao.database import get_db

from src.users.models import User
from sqlalchemy.future import select
from typing import Dict, Any
from passlib.context import CryptContext

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
import jwt
from datetime import datetime, timedelta
from src.users.UserDao import UserDAO
from jwt import PyJWTError

#JWT токен
# Настройки безопасности
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth")

router = APIRouter()

# Функция для создания JWT токена
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
async def register_user(
    user: UserCreate, 
    db: AsyncSession = Depends(get_db)
):  # Используем AsyncSession
    # Создание нового пользователя
    new_user = await UserDAO.registration(
        session=db, 
        user=user
    )  
    return {
        "message": f"User with ID {new_user.id} registered successfully",
        "user_tg_id": new_user.tg_id
    }


#Возможно ненужная
import random
@router.get("/get_many_profiles", response_model=Dict[str, Any])
async def get_random_profiles(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    page_size = 10
    page = 1 

    result = await UserDAO.paginate(
        session=db,
        page=page,
        page_size=page_size,
    )

    if not result.values:
        return {"profiles": []}  # Возвращаем пустой массив, если профилей нет

    # Перемешиваем профили случайным образом
    random.shuffle(result.values)

    return {
        "profiles": [
            {
                "profile_id": profile.id,
                "name": profile.name,
                "email": profile.email,
                "birth_date": profile.birth_date,
                "city": profile.city,
                "about": profile.about,
                "tg_id": profile.tg_id,
            }
            for profile in result.values
        ]
    }

#Возможно ненужная
@router.post("/login", response_model=Dict[str, Any])
async def login_user(
    login_data: UserLogin,  # Принимаем словарь с tg_id и password
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    # Ищем пользователя по tg_id
    result = await db.execute(
        select(User).where(User.tg_id == login_data.tg_id)
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this Telegram ID not found"
        )
    if not pwd_context.verify(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    user_data = {
        "user_id": user.id,
        "tg_id": user.tg_id,
        "name": user.name,
        "email": user.email,
        "birth_date": user.birth_date,
        "city": user.city,
        "about": user.about,
    }
    return user_data

# Аутентификация (получение токена)
@router.post("/auth", response_model=dict)
async def authenticate_user(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db)
):
    user = (await UserDAO.paginate(
        tg_id=form_data.username
        )
    ).values[0]

    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# Получение текущего пользователя
async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user = await UserDAO.get(
        session=db,
        id=user_id
    )
    if user is None:
        raise credentials_exception
    return user

# Эндпоинт получения профиля текущего пользователя
@router.get("/get_profile", response_model=UserProfileResponse)
async def read_profile(
        current_user: User = Depends(get_current_user)
):
    return current_user


# Эндпоинт обновления профиля текущего пользователя
@router.put("/update_profile", response_model=UserProfileResponse)
async def update_profile(
        user_update: UserCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)

    if "password" in update_data:
        update_data["password"] = pwd_context.hash(update_data["password"])

    updated_user = await UserDAO.update(session=db, id=current_user.id, **update_data)

    return updated_user

#эндпоинт получения всех пользователей
@router.get("/users", response_model=list[UserProfileResponse])
async def get_all_users_except_current(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    users = await UserDAO.get_all_users(db)
    return [user for user in users if user.id != current_user.id]

#эндпоинт работы со свайпами
@router.post("/swipes", status_code=status.HTTP_200_OK)
async def handle_swipe(
    swipe_data: SwipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Проверка что target_user существует
    target_user = await UserDAO.get(
        session=db, 
        id=swipe_data.target_user_id
    )
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Нельзя свайпать себя
    if current_user.id == swipe_data.target_user_id:
        raise HTTPException(status_code=400, detail="Cannot swipe yourself")
    
    is_updated, is_match = await UserDAO.add_swipe(
        session=db,
        user_id=current_user.id,
        target_user_id=swipe_data.target_user_id,
        action=swipe_data.action.value
    )
    
    if is_match:
        return {
            "status": "match",
            "message": "It's a match!",
            "user": {
                "id": target_user.id,
                "name": target_user.name
            }
        }
    
    return {"status": "success", "updated": is_updated}
