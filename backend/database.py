from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.database_url,
    pool_size=10,       # number of persistent connections
    max_overflow=20,    # extra connections allowed under load
    pool_pre_ping=True, # test connections before using (handles dropped connections)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
