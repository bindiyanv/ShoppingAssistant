from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # needed for SQLite + FastAPI
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401  (register models)

    Base.metadata.create_all(bind=engine)
