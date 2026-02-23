"""
Configuration de la base de données
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from functools import lru_cache

Base = declarative_base()


@lru_cache()
def get_database_url():
    """Récupère l'URL de la base de données"""
    url = os.getenv(
        "DATABASE_URL",
        "postgresql://eventapp:devpassword@localhost:5432/eventapp"
    )
    # Railway/Heroku utilisent postgres:// mais SQLAlchemy 2.0 requiert postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    print(f"[DB] Connecting to: {url[:30]}...")  # Log pour debug (masqué)
    return url


@lru_cache()
def get_engine():
    """Crée le moteur SQLAlchemy (lazy loading)"""
    return create_engine(get_database_url())


def get_session_local():
    """Crée le sessionmaker"""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db():
    """Dependency pour obtenir une session de BDD"""
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pour compatibilité avec les imports existants
def get_engine_instance():
    return get_engine()

engine = property(lambda self: get_engine())
