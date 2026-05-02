import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


def _default_database_url() -> str:
    return os.getenv(
        "DATABASE_URL", "postgresql://postgres:password@localhost:5432/expense_tracker"
    )


DATABASE_URL = os.getenv("DATABASE_URL", _default_database_url())

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
