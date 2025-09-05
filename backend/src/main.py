from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.dao.database import Base, engine
from src.users.router import router as user_router
from src.posts.router import router_post as post_router

app = FastAPI()

# Настройка CORS: разрешаем запросы с указанных источников (например, с фронтенда на http://localhost:3000)
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3500",
    "http://localhost:8080",
    "http://localhost:8000",
    # Добавьте дополнительные источники по необходимости
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Разрешённые источники запросов
    allow_credentials=True,
    allow_methods=["*"],         # Разрешаем все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],         # Разрешаем все заголовки
)

# Подключение маршрутов
app.include_router(user_router, prefix="/api", tags=["user"])
app.include_router(post_router, prefix="/api_post", tags=["post"])

# Функция для создания таблиц в базе (используется при старте приложения)
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def on_startup():
    await create_tables()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Edworking Backend"}
