from sqlalchemy import (
    Select,
    and_,
    delete as sqlalchemy_delete,
    func,
    insert,
    or_,
    update as sqlalchemy_update,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import (
    Any, Dict, Generic, List, Optional, Type, TypeVar, Union, Unpack
)
from pydantic import BaseModel
from src.dao.session_manager import SessionManager
from src.dao.shemas import PagePaginate

ModelType = TypeVar("ModelType")
SchemaType = TypeVar("SchemaType", bound=BaseModel)

class BaseDAO(Generic[ModelType]):
    """Базовый класс для работы с БД"""

    model: Type[ModelType]
    options: List[Any] = []

    @classmethod
    @SessionManager.with_session()
    async def get(
        cls,
        session: AsyncSession,
        id: int,  # noqa
    ) -> Optional[ModelType]:
        """Получает запись по её первичному ключу.

        Параметры:
            session - асинхронная сессия SQLAlchemy.
            id - идентификатор записи.
        Возвращает:
            Запись, найденную по id. Если запись не найдена,
            выбрасывается исключение.
        """
        query = select(cls.model).filter_by(id=id).options(*cls.options)
        result = await session.execute(query)
        return result.scalar_one_or_none()
    
    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def create(
        cls,
        session: AsyncSession,
        returning: bool = True,
        **values: Unpack[Dict[str, Any]],
    ) -> Optional[ModelType]:
        """Создаёт новую запись в базе данных.

        Параметры:
            session - асинхронная сессия SQLAlchemy.
            returning - если True, метод возвращает созданный объект.
            values - значения для создания записи.
        Возвращает:
            Созданный объект или количество затронутых строк.
            Если запись не была создана, выбрасывается исключение.
        """
        query = insert(cls.model).values(**values)

        if returning:
            query = query.returning(cls.model).options(*cls.options)
        result = await session.execute(query)
        if returning:
            return result.scalar_one()
        
    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def update(
        cls,
        session: AsyncSession,
        id: Union[int, str],  # noqa
        returning: bool = True,
        **values: Any,
    ) -> Optional[ModelType]:
        """Обновляет запись по её идентификатору.

        Параметры:
            session - асинхронная сессия SQLAlchemy.
            id - идентификатор записи.
            returning - если True, возвращает обновлённый объект.
            values - поля и их новые значения для обновления.
        Возвращает:
            Обновлённый объект или количество затронутых строк.
            Если запись не найдена, выбрасывается исключение.
        """
        query = (
            sqlalchemy_update(cls.model)
            .where(cls.model.id == id)
            .values(**values)
        )

        if returning:
            query = query.returning(cls.model).options(*cls.options)
        else:
            query = query.returning(cls.model.id)

        result = await session.execute(query)

        if returning:
            updated_obj = result.scalar_one()
            await session.refresh(updated_obj)
            return updated_obj

        result.scalar_one()

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def delete(
        cls,
        session: AsyncSession,
        id: Union[int, str],  # noqa
        returning: bool = True,
    ) -> Optional[ModelType]:
        """Удаляет запись по её идентификатору.

        Параметры:
            session - асинхронная сессия SQLAlchemy.
            id - идентификатор записи для удаления.
            returning - если True, возвращает удалённый объект.
        Возвращает:
            Удалённый объект или количество затронутых строк.
            Если запись не найдена, выбрасывается исключение.
        """
        query = sqlalchemy_delete(cls.model).where(cls.model.id == id)
        if returning:
            query = query.returning(cls.model).options(*cls.options)
        else:
            query = query.returning(cls.model.id)
        result = await session.execute(query)
        if returning:
            deleted_obj = result.scalar_one()
            return deleted_obj

        result.scalar_one()

    @classmethod
    @SessionManager.with_session(auto_commit=False)
    async def paginate(
        cls,
        session: AsyncSession,
        page: int = 1,
        page_size: int = -1,
        search_query: Optional[str] = None,
        base_query: Optional[Select] = None,
        search_fields: Optional[List[str]] = None,
        include_nullable: Optional[bool] = True,
        **filters: Unpack[Dict[str, Any]]
    ) -> PagePaginate:
        """Пагинация (разбиение на страницы) выборки записей.

        Параметры:
            session - асинхронная сессия SQLAlchemy.
            page - номер текущей страницы.
            page_size - количество записей на страницу
            (-1 означает, что пагинация не применяется).
            search_query - поисковый запрос для фильтрации по текстовым полям.
            base_query - базовый запрос для выборки
            (если не указан, используется запрос по модели).
            search_fields - список полей модели,
            по которым будет применяться поиск.
            filters - дополнительные условия фильтрации.
        Возвращает:
            Объект PagePaginate, содержащий список записей,
            общее количество записей,
            номер текущей страницы, общее количество страниц и размер страницы.
        """
        query = base_query if base_query is not None else select(cls.model)

        # Добавляем опции загрузки связанных данных
        query = query.options(*cls.options)

        # Добавляем условия поиска если есть поисковый запрос
        if search_query and search_fields:
            search_conditions = []
            query_text = f"%{search_query.strip().lower()}%"

            for field_name in search_fields:
                if hasattr(cls.model, field_name):
                    field = getattr(cls.model, field_name)
                    search_conditions.append(
                        func.lower(field).like(query_text)
                    )
            if search_conditions:
                query = query.where(or_(*search_conditions))

        # Добавляем дополнительные фильтры
        filter_conditions = []
        for field_name, value in filters.items():
            if hasattr(cls.model, field_name):
                field = getattr(cls.model, field_name)
                if value is None and include_nullable:
                    filter_conditions.append(field.is_(None))
                elif value is not None:
                    filter_conditions.append(field == value)
        if filter_conditions:
            query = query.where(and_(*filter_conditions))

        # Получаем общее количество записей для пагинации
        count_query = select(func.count()).select_from(query.subquery())
        total = await session.scalar(count_query)

        if page_size == -1:
            total_pages = 1
            page = 1
        else:
            total_pages = (total + page_size - 1) // page_size
            page = min(max(1, page), total_pages) if total_pages > 0 else 1
            query = query.offset((page - 1) * page_size).limit(page_size)

        result = await session.execute(query)
        items = result.scalars().all()

        return PagePaginate(
            values=items,
            total=total,
            page=page,
            pages=total_pages,
            page_size=page_size
        )
    