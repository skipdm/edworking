from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    async_sessionmaker, create_async_engine
)

# Загружаем переменные окружения
load_dotenv()

# Получаем переменные для подключения к PostgreSQL
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "db")

# Формируем строку подключения
DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:5432/{POSTGRES_DB}"

# Создаем асинхронный движок
engine = create_async_engine(DATABASE_URL, echo=True)

async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


# Базовый класс для моделей
Base = declarative_base()

# Функция для получения сессии
async def get_db():
    async with async_session_maker() as session:
        async with session.begin():
            yield session
