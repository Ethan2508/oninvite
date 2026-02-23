"""
SaveTheDate API - Point d'entrée principal
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SaveTheDate API",
    description="API pour l'application événementielle white-label",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod, restreindre aux domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
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
