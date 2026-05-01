import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

def _default_database_url() -> str:
    # Render (and many PaaS) only guarantee write access to /tmp unless a persistent disk is attached.
    # Using /tmp keeps the "single-service" deploy working out of the box.
    if os.getenv("RENDER"):
        return "sqlite:////tmp/expense_tracker.sqlite"
    return "sqlite:///./expense_tracker.sqlite"


DATABASE_URL = os.getenv("DATABASE_URL", _default_database_url())

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

    # Ensure the sqlite file directory exists (e.g. sqlite:////var/data/app.sqlite).
    # For sqlite:///./relative.sqlite, SQLAlchemy resolves relative to the process CWD,
    # so we keep that behavior and only create parent dirs when a concrete path is provided.
    if DATABASE_URL.startswith("sqlite:////"):
        sqlite_path = Path(DATABASE_URL[len("sqlite:////") :])
        sqlite_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
