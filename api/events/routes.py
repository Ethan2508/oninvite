"""
Routes pour les événements
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event
from core.schemas import (
    EventCreate, EventUpdate, EventResponse, 
    EventConfigResponse, SuccessResponse
)from core.security import verify_admin_api_key
router = APIRouter()


@router.get("/", response_model=List[EventResponse])
async def list_events(
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Liste tous les événements (pour le CMS) - Protégé par API key"""
    query = db.query(Event)
    
    if status:
        query = query.filter(Event.status == status)
    
    events = query.order_by(Event.event_date.desc()).offset(skip).limit(limit).all()
    return events


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Récupère un événement par ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{event_id}/config")
async def get_event_config(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Récupère la configuration d'un événement (endpoint principal pour l'app mobile)
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Retourner directement le JSON de config
    return event.config


@router.get("/slug/{slug}/config")
async def get_event_config_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Récupère la configuration par slug (alternative à l'ID)
    """
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event.config


@router.post("/", response_model=EventResponse, status_code=201)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Crée un nouvel événement (CMS) - Protégé par API key"""
    # Vérifier que le slug n'existe pas déjà
    existing = db.query(Event).filter(Event.slug == event_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    event = Event(
        slug=event_data.slug,
        type=event_data.type,
        title=event_data.title,
        subtitle=event_data.subtitle,
        event_date=event_data.event_date,
        end_date=event_data.end_date,
        timezone=event_data.timezone,
        languages=event_data.languages,
        default_language=event_data.default_language,
        pack=event_data.pack,
        config=event_data.config,
        client_name=event_data.client_name,
        client_email=event_data.client_email,
        client_phone=event_data.client_phone,
        status='draft'
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Met à jour un événement (CMS) - Protégé par API key"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Mettre à jour les champs fournis
    update_data = event_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/{event_id}", response_model=SuccessResponse)
async def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Supprime un événement (CMS) - Protégé par API key"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    
    return SuccessResponse(message="Event deleted successfully")


# === Routes de lifecycle ===

from datetime import datetime, timedelta
from pydantic import BaseModel


class StatusUpdate(BaseModel):
    status: str  # draft, live, souvenir, expired


class RenewalRequest(BaseModel):
    months: int = 12  # Durée du renouvellement


@router.patch("/{event_id}/status", response_model=EventResponse)
async def update_event_status(
    event_id: UUID,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """
    Met à jour le statut d'un événement.
    Transitions valides:
    - draft → pending_review → live
    - live → souvenir (après la date)
    - souvenir → expired (après expiration)
    - expired → souvenir (renouvellement)
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    valid_statuses = ['draft', 'pending_review', 'live', 'souvenir', 'expired']
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    # Mettre à jour le statut
    old_status = event.status
    event.status = data.status
    
    # Si passage en live, s'assurer que expires_at est défini
    if data.status == 'live' and not event.expires_at:
        event.expires_at = event.event_date + timedelta(days=365)
    
    db.commit()
    db.refresh(event)
    
    return event


@router.post("/{event_id}/renew", response_model=EventResponse)
async def renew_event(
    event_id: UUID,
    data: RenewalRequest,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """
    Renouvelle un événement (prolonge son expiration).
    Utilisé pour les clients qui veulent garder l'accès après expiration.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    now = datetime.utcnow()
    
    # Calculer la nouvelle date d'expiration
    if event.expires_at and event.expires_at > now:
        # Prolonger depuis la date d'expiration actuelle
        new_expires = event.expires_at + timedelta(days=30 * data.months)
    else:
        # Prolonger depuis maintenant
        new_expires = now + timedelta(days=30 * data.months)
    
    event.expires_at = new_expires
    
    # Remettre en mode souvenir si était expiré
    if event.status == 'expired':
        event.status = 'souvenir'
    
    db.commit()
    db.refresh(event)
    
    return event


@router.get("/{event_id}/lifecycle")
async def get_event_lifecycle(
    event_id: UUID,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """
    Récupère les informations de lifecycle d'un événement.
    Utile pour le CMS pour afficher l'état et les actions possibles.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    now = datetime.utcnow()
    
    # Calculer les jours restants
    days_until_event = None
    days_until_expiration = None
    
    if event.event_date:
        delta = event.event_date.replace(tzinfo=None) - now
        days_until_event = delta.days
    
    if event.expires_at:
        delta = event.expires_at.replace(tzinfo=None) - now
        days_until_expiration = delta.days
    
    # Déterminer les actions possibles
    actions = []
    if event.status == 'draft':
        actions.append('publish')
    elif event.status == 'live':
        if days_until_event and days_until_event < 0:
            actions.append('archive')  # Passer en souvenir
    elif event.status == 'souvenir':
        actions.append('renew')
    elif event.status == 'expired':
        actions.append('renew')
        actions.append('delete')
    
    return {
        "event_id": str(event.id),
        "status": event.status,
        "event_date": event.event_date.isoformat() if event.event_date else None,
        "expires_at": event.expires_at.isoformat() if event.expires_at else None,
        "days_until_event": days_until_event,
        "days_until_expiration": days_until_expiration,
        "is_past": days_until_event < 0 if days_until_event is not None else None,
        "is_expiring_soon": days_until_expiration is not None and 0 < days_until_expiration <= 30,
        "is_expired": days_until_expiration is not None and days_until_expiration <= 0,
        "available_actions": actions
    }

