"""
Routes pour le livre d'or
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event, GuestbookEntry
from core.schemas import (
    GuestbookEntryCreate, GuestbookEntryResponse, SuccessResponse
)

router = APIRouter()


@router.post("/{event_id}/guestbook", response_model=GuestbookEntryResponse, status_code=201)
async def create_guestbook_entry(
    event_id: UUID,
    entry_data: GuestbookEntryCreate,
    db: Session = Depends(get_db)
):
    """
    Poster un message dans le livre d'or (depuis l'app mobile)
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier que le module livre d'or est activé
    guestbook_config = event.config.get('modules', {}).get('guestbook', {})
    if not guestbook_config.get('enabled', False):
        raise HTTPException(status_code=403, detail="Guestbook module is not enabled")
    
    # Vérifier si la modération est activée
    needs_moderation = guestbook_config.get('moderation', False)
    
    entry = GuestbookEntry(
        event_id=event_id,
        author_name=entry_data.author_name,
        message=entry_data.message,
        photo_url=entry_data.photo_url,
        approved=not needs_moderation
    )
    
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    return entry


@router.get("/{event_id}/guestbook", response_model=List[GuestbookEntryResponse])
async def list_guestbook_entries(
    event_id: UUID,
    approved_only: bool = Query(True, description="Afficher uniquement les messages approuvés"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Liste les messages du livre d'or"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(GuestbookEntry).filter(GuestbookEntry.event_id == event_id)
    
    if approved_only:
        query = query.filter(GuestbookEntry.approved == True)
    
    entries = query.order_by(GuestbookEntry.created_at.desc()).offset(skip).limit(limit).all()
    return entries


@router.put("/{event_id}/guestbook/{entry_id}/approve", response_model=GuestbookEntryResponse)
async def approve_guestbook_entry(
    event_id: UUID,
    entry_id: UUID,
    db: Session = Depends(get_db)
):
    """Approuve un message (CMS)"""
    entry = db.query(GuestbookEntry).filter(
        GuestbookEntry.id == entry_id,
        GuestbookEntry.event_id == event_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    entry.approved = True
    db.commit()
    db.refresh(entry)
    
    return entry


@router.delete("/{event_id}/guestbook/{entry_id}", response_model=SuccessResponse)
async def delete_guestbook_entry(
    event_id: UUID,
    entry_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprime un message (CMS)"""
    entry = db.query(GuestbookEntry).filter(
        GuestbookEntry.id == entry_id,
        GuestbookEntry.event_id == event_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(entry)
    db.commit()
    
    return SuccessResponse(message="Entry deleted successfully")
