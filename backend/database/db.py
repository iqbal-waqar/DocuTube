from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.utils.config import config

engine = create_engine(config.database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
