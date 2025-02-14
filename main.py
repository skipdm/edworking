from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy import Column, Integer, String, Date, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.hash import bcrypt
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Инициализация FastAPI
app = FastAPI()

# Разрешаем запросы с фронтенда
app.add_middleware( # type: ignore
    CORSMiddleware,
    allow_origins=["*"],  # Можно указать ["http://localhost:5173"] для безопасности
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройка базы данных
DATABASE_URL = "sqlite:///./users.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Модель SQLAlchemy для хранения данных в БД
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    tg_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=False)
    city = Column(String, nullable=False)
    about = Column(String, nullable=True)  # Поле "О себе" теперь необязательное

# Создание таблицы (если не существует)
Base.metadata.create_all(bind=engine)

# Pydantic-модель для валидации входящих данных
class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=6)  # type: ignore # Минимальная длина пароля - 6 символов
    tg_id: str  # Telegram ID (обязательное поле)
    name: str  # Имя пользователя (обязательное поле)
    birth_date: date  # Дата рождения (обязательное поле)
    city: str # Город пользователя (обязательное поле)
    about: Optional[str] = None  # Поле "О себе" необязательное

# Зависимость для сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Лямбда-функции для работы с пользователями
hash_password = lambda password: bcrypt.hash(password)
get_user_by_email = lambda db, email: db.query(User).filter(User.email == email).first()
get_user_by_tg_id = lambda db, tg_id: db.query(User).filter(User.tg_id == tg_id).first()
generate_message = lambda user_id: f"User with ID {user_id} registered successfully"


@app.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли пользователь с таким email или tg_id
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_tg_id(db, user.tg_id):
        raise HTTPException(status_code=400, detail="Telegram ID already registered")

    # Создаем нового пользователя
    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        tg_id=user.tg_id,
        name=user.name,
        birth_date=user.birth_date,
        city=user.city,
        about=user.about  # Если не передано - будет None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": generate_message(new_user.id), "user_id": new_user.id, "user_tg_id": new_user.tg_id}