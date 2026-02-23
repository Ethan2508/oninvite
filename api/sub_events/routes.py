"""
Routes pour les sous-événements (Mairie, Henné, Houppa, etc.)
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event, SubEvent
from core.schemas import (
    SubEventCreate, SubEventUpdate, SubEventResponse, SuccessResponse
)

router = APIRouter()

# Templates de sous-événements pour les mariages
SUB_EVENT_TEMPLATES = [
    {"slug": "mairie", "name": "Cérémonie civile", "dress_code": "Tenue de ville"},
    {"slug": "henne", "name": "Soirée Henné", "dress_code": "Tenue traditionnelle"},
    {"slug": "houppa", "name": "Cérémonie religieuse & Houppa", "dress_code": "Tenue de soirée"},
    {"slug": "party", "name": "Soirée & Dîner", "dress_code": "Tenue de gala"},
    {"slug": "chabbat", "name": "Chabbat Hatan", "dress_code": "Chic décontracté"},
    {"slug": "cocktail", "name": "Cocktail", "dress_code": "Tenue de soirée"},
    {"slug": "brunch", "name": "Brunch du lendemain", "dress_code": "Décontracté"},
]


@router.get("/templates")
async def get_sub_event_templates():
    """Retourne les templates de sous-événements disponibles"""
    return SUB_EVENT_TEMPLATES


@router.post("/{event_id}/sub-events", response_model=SubEventResponse, status_code=201)
async def create_sub_event(
    event_id: UUID,
    sub_event_data: SubEventCreate,
    db: Session = Depends(get_db)
):
    """Créer un sous-événement"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Créer le sous-événement
    sub_event = SubEvent(
        event_id=event_id,
        slug=sub_event_data.slug,
        name=sub_event_data.name,
        date=sub_event_data.date,
        start_time=sub_event_data.start_time,
        end_time=sub_event_data.end_time,
        location_name=sub_event_data.location_name,
        location_address=sub_event_data.location_address,
        latitude=sub_event_data.latitude,
        longitude=sub_event_data.longitude,
        dress_code=sub_event_data.dress_code,
        notes=sub_event_data.notes,
        sort_order=sub_event_data.sort_order
    )
    
    db.add(sub_event)
    db.commit()
    db.refresh(sub_event)
    
    return sub_event


@router.get("/{event_id}/sub-events", response_model=List[SubEventResponse])
async def list_sub_events(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Liste les sous-événements d'un événement"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    sub_events = (
        db.query(SubEvent)
        .filter(SubEvent.event_id == event_id)
        .order_by(SubEvent.sort_order, SubEvent.date)
        .all()
    )
    
    return sub_events


@router.get("/{event_id}/sub-events/{sub_event_id}", response_model=SubEventResponse)
async def get_sub_event(
    event_id: UUID,
    sub_event_id: UUID,
    db: Session = Depends(get_db)
):
    """Récupère un sous-événement"""
    sub_event = (
        db.query(SubEvent)
        .filter(SubEvent.id == sub_event_id, SubEvent.event_id == event_id)
        .first()
    )
    
    if not sub_event:
        raise HTTPException(status_code=404, detail="Sub-event not found")
    
    return sub_event


@router.put("/{event_id}/sub-events/{sub_event_id}", response_model=SubEventResponse)
async def update_sub_event(
    event_id: UUID,
    sub_event_id: UUID,
    update_data: SubEventUpdate,
    db: Session = Depends(get_db)
):
    """Modifier un sous-événement"""
    sub_event = (
        db.query(SubEvent)
        .filter(SubEvent.id == sub_event_id, SubEvent.event_id == event_id)
        .first()
    )
    
    if not sub_event:
        raise HTTPException(status_code=404, detail="Sub-event not found")
    
    # Appliquer les mises à jour
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(sub_event, field, value)
    
    db.commit()
    db.refresh(sub_event)
    
    return sub_event


@router.delete("/{event_id}/sub-events/{sub_event_id}", response_model=SuccessResponse)
async def delete_sub_event(
    event_id: UUID,
    sub_event_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprimer un sous-événement"""
    sub_event = (
        db.query(SubEvent)
        .filter(SubEvent.id == sub_event_id, SubEvent.event_id == event_id)
        .first()
    )
    
    if not sub_event:
        raise HTTPException(status_code=404, detail="Sub-event not found")
    
    db.delete(sub_event)
    db.commit()
    
    return SuccessResponse(message="Sub-event deleted successfully")


@router.post("/{event_id}/sub-events/reorder", response_model=SuccessResponse)
async def reorder_sub_events(
    event_id: UUID,
    sub_event_ids: List[UUID],
    db: Session = Depends(get_db)
):
    """Réordonner les sous-événements"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Mettre à jour l'ordre
    for index, sub_event_id in enumerate(sub_event_ids):
        db.query(SubEvent).filter(
            SubEvent.id == sub_event_id,
            SubEvent.event_id == event_id
        ).update({"sort_order": index})
    
    db.commit()
    
    return SuccessResponse(message="Sub-events reordered successfully")
