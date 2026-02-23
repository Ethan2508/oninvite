"""
Routes pour la playlist collaborative
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event, PlaylistSuggestion
from core.schemas import (
    PlaylistSuggestionCreate, PlaylistSuggestionResponse, SuccessResponse
)

router = APIRouter()


@router.post("/{event_id}/playlist", response_model=PlaylistSuggestionResponse, status_code=201)
async def suggest_song(
    event_id: UUID,
    suggestion_data: PlaylistSuggestionCreate,
    db: Session = Depends(get_db)
):
    """
    Suggérer une chanson (depuis l'app mobile)
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier que le module playlist est activé
    playlist_config = event.config.get('modules', {}).get('playlist', {})
    if not playlist_config.get('enabled', False):
        raise HTTPException(status_code=403, detail="Playlist module is not enabled")
    
    # Vérifier le nombre max de suggestions par invité
    max_suggestions = playlist_config.get('max_suggestions_per_guest', 5)
    current_count = db.query(PlaylistSuggestion).filter(
        PlaylistSuggestion.event_id == event_id,
        PlaylistSuggestion.guest_name == suggestion_data.guest_name
    ).count()
    
    if current_count >= max_suggestions:
        raise HTTPException(
            status_code=400, 
            detail=f"Maximum {max_suggestions} suggestions per guest reached"
        )
    
    suggestion = PlaylistSuggestion(
        event_id=event_id,
        guest_name=suggestion_data.guest_name,
        song_title=suggestion_data.song_title,
        artist=suggestion_data.artist,
        spotify_url=suggestion_data.spotify_url
    )
    
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    
    return suggestion


@router.get("/{event_id}/playlist", response_model=List[PlaylistSuggestionResponse])
async def list_suggestions(
    event_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Liste les suggestions de playlist"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    suggestions = db.query(PlaylistSuggestion).filter(
        PlaylistSuggestion.event_id == event_id
    ).order_by(PlaylistSuggestion.created_at.desc()).offset(skip).limit(limit).all()
    
    return suggestions


@router.delete("/{event_id}/playlist/{suggestion_id}", response_model=SuccessResponse)
async def delete_suggestion(
    event_id: UUID,
    suggestion_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprime une suggestion (CMS)"""
    suggestion = db.query(PlaylistSuggestion).filter(
        PlaylistSuggestion.id == suggestion_id,
        PlaylistSuggestion.event_id == event_id
    ).first()
    
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    db.delete(suggestion)
    db.commit()
    
    return SuccessResponse(message="Suggestion deleted successfully")
