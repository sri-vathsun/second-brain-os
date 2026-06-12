from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from config import settings

# Build engine kwargs based on the database type
_engine_kwargs: dict = {}
if settings.database_url.startswith("sqlite"):
    # SQLite needs check_same_thread=False for FastAPI's threaded requests
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # NullPool is required for serverless environments (Vercel)
    # Each request gets a fresh connection — no persistent pool
    _engine_kwargs["poolclass"] = NullPool
    _engine_kwargs["pool_pre_ping"] = True

engine = create_engine(settings.database_url, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
