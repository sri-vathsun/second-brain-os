from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from config import settings

# NullPool is required for serverless environments (Vercel)
# Each request gets a fresh connection — no persistent pool
engine = create_engine(
    settings.database_url,
    poolclass=NullPool,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
