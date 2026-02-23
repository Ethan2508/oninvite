"""
SaveTheDate API - Point d'entrée principal
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SaveTheDate API",
    description="API pour l'application événementielle white-label",
    version="1.0.0"
)

# Configuration CORS - utilise la variable d'environnement ou autorise tout en dev
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "SaveTheDate API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check pour Docker/Kubernetes"""
    return {"status": "healthy"}


@app.get("/debug")
async def debug_check():
    """Debug endpoint - vérifie tous les composants"""
    import os
    from core.database import _get_database_url
    
    db_url = _get_database_url()
    # Masquer le mot de passe
    masked_url = db_url.split("@")[1] if "@" in db_url else "NOT_SET"
    
    result = {
        "status": "ok",
        "database_host": masked_url,
        "env_vars": {
            "DATABASE_URL": "SET" if os.environ.get("DATABASE_URL") else "NOT_SET",
            "ADMIN_API_KEY": "SET" if os.environ.get("ADMIN_API_KEY") else "NOT_SET",
            "PORT": os.environ.get("PORT", "NOT_SET"),
        }
    }
    
    # Test DB connection
    try:
        from core.database import _get_engine
        from sqlalchemy import text
        engine = _get_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        result["database_connection"] = "OK"
    except Exception as e:
        result["database_connection"] = f"ERROR: {str(e)}"
    
    return result


# Import des routes
from events.routes import router as events_router
from events.seating import router as seating_router
from guests.routes import router as guests_router
from photos.routes import router as photos_router
from guestbook.routes import router as guestbook_router
from donations.routes import router as donations_router
from notifications.routes import router as notifications_router
from playlist.routes import router as playlist_router
from sub_events.routes import router as sub_events_router
from groups.routes import router as groups_router


# Créer les tables au démarrage
@app.on_event("startup")
async def create_tables():
    """Crée les tables si elles n'existent pas"""
    try:
        from core.database import Base, _get_engine
        from core import models  # Import pour enregistrer les modèles
        engine = _get_engine()
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"⚠️ Database table creation error: {e}")


# Enregistrement des routes
app.include_router(events_router, prefix="/api/events", tags=["events"])
app.include_router(seating_router, prefix="/api/events", tags=["seating"])
app.include_router(guests_router, prefix="/api/events", tags=["guests"])
app.include_router(photos_router, prefix="/api/events", tags=["photos"])
app.include_router(guestbook_router, prefix="/api/events", tags=["guestbook"])
app.include_router(donations_router, prefix="/api/events", tags=["donations"])
app.include_router(notifications_router, prefix="/api/events", tags=["notifications"])
app.include_router(playlist_router, prefix="/api/events", tags=["playlist"])
app.include_router(sub_events_router, prefix="/api/events", tags=["sub-events"])
app.include_router(groups_router, prefix="/api/events", tags=["invitation-groups"])
