"""
Configuration de la base de données
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# Variables globales
_engine = None
_SessionLocal = None


def _get_database_url():
    """Récupère l'URL de la base de données"""
    url = os.environ.get(
        "DATABASE_URL",
        "postgresql://eventapp:devpassword@localhost:5432/eventapp"
    )
    # Railway/Heroku utilisent postgres:// mais SQLAlchemy 2.0 requiert postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def _get_engine():
    """Crée le moteur SQLAlchemy (lazy loading)"""
    global _engine
    if _engine is None:
        _engine = create_engine(_get_database_url())
    return _engine


def _get_session_local():
    """Crée le sessionmaker (lazy loading)"""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal


def get_db():
    """Dependency pour obtenir une session de BDD"""
    SessionLocal = _get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Alias pour compatibilité avec les imports existants
class SessionLocal:
    """Wrapper pour créer des sessions (compatibilité)"""
    def __new__(cls):
        return _get_session_local()()
