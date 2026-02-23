"""
Configuration de la base de données
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://eventapp:devpassword@localhost:5432/eventapp"
)

# Railway/Heroku utilisent postgres:// mais SQLAlchemy 2.0 requiert postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency pour obtenir une session de BDD"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
