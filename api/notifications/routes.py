"""
Routes pour les notifications push
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event, PushNotification
from core.schemas import (
    NotificationCreate, NotificationResponse, SuccessResponse
)from core.security import verify_admin_api_keyfrom .firebase_service import send_to_event, is_firebase_available

router = APIRouter()


@router.post("/{event_id}/notifications", response_model=NotificationResponse, status_code=201)
async def create_notification(
    event_id: UUID,
    notif_data: NotificationCreate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """
    Créer et envoyer une notification (CMS)
    
    Si scheduled_at est fourni, la notification sera envoyée plus tard.
    Sinon, envoi immédiat via Firebase FCM.
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier le quota (pack Essentiel = 5 notifs max)
    if event.pack == 'essential':
        sent_count = db.query(PushNotification).filter(
            PushNotification.event_id == event_id,
            PushNotification.status == 'sent'
        ).count()
        
        if sent_count >= 5:
            raise HTTPException(
                status_code=400, 
                detail="Notification quota reached (5/5 for Essential pack)"
            )
    
    # Déterminer le statut
    if notif_data.scheduled_at:
        # Programmé pour plus tard
        status = 'scheduled'
        sent_at = None
        fcm_result = None
    else:
        # Envoi immédiat via Firebase FCM
        fcm_result = send_to_event(
            event_id=str(event_id),
            title=notif_data.title,
            body=notif_data.message
        )
        
        if fcm_result.get("success") or fcm_result.get("simulated"):
            status = 'sent'
            sent_at = datetime.utcnow()
        else:
            status = 'failed'
            sent_at = None
    
    notification = PushNotification(
        event_id=event_id,
        title=notif_data.title,
        message=notif_data.message,
        scheduled_at=notif_data.scheduled_at,
        sent_at=sent_at,
        status=status
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification


@router.get("/{event_id}/notifications", response_model=List[NotificationResponse])
async def list_notifications(
    event_id: UUID,
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Liste les notifications d'un événement (CMS) - Protégé par API key"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(PushNotification).filter(PushNotification.event_id == event_id)
    
    if status:
        query = query.filter(PushNotification.status == status)
    
    notifications = query.order_by(PushNotification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/{event_id}/notifications/{notif_id}", response_model=NotificationResponse)
async def get_notification(
    event_id: UUID,
    notif_id: UUID,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Récupère une notification par ID - Protégé par API key"""
    notification = db.query(PushNotification).filter(
        PushNotification.id == notif_id,
        PushNotification.event_id == event_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return notification


@router.delete("/{event_id}/notifications/{notif_id}", response_model=SuccessResponse)
async def cancel_notification(
    event_id: UUID,
    notif_id: UUID,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Annule une notification programmée (CMS) - Protégé par API key"""
    notification = db.query(PushNotification).filter(
        PushNotification.id == notif_id,
        PushNotification.event_id == event_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.status == 'sent':
        raise HTTPException(status_code=400, detail="Cannot cancel a sent notification")
    
    db.delete(notification)
    db.commit()
    
    return SuccessResponse(message="Notification cancelled successfully")


# === Routes d'abonnement (mobile) ===

from pydantic import BaseModel
from .firebase_service import subscribe_to_topic, unsubscribe_from_topic


class SubscribeRequest(BaseModel):
    token: str
    platform: Optional[str] = None


@router.post("/subscribe/{event_id}", response_model=SuccessResponse)
async def subscribe_to_event(
    event_id: UUID,
    data: SubscribeRequest,
    db: Session = Depends(get_db)
):
    """
    Abonne un device aux notifications d'un événement (mobile).
    Le token FCM sera abonné au topic event_{event_id}.
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Abonner au topic Firebase
    result = subscribe_to_topic(data.token, str(event_id))
    
    if result.get("success") or result.get("simulated"):
        return SuccessResponse(message=f"Subscribed to event {event_id}")
    else:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to subscribe: {result.get('error')}"
        )


@router.post("/unsubscribe/{event_id}", response_model=SuccessResponse)
async def unsubscribe_from_event(
    event_id: UUID,
    data: SubscribeRequest,
    db: Session = Depends(get_db)
):
    """
    Désabonne un device des notifications d'un événement (mobile).
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Désabonner du topic Firebase
    result = unsubscribe_from_topic(data.token, str(event_id))
    
    if result.get("success") or result.get("simulated"):
        return SuccessResponse(message=f"Unsubscribed from event {event_id}")
    else:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to unsubscribe: {result.get('error')}"
        )


@router.get("/{event_id}/notifications/stats")
async def get_notification_stats(
    event_id: UUID,
    db: Session = Depends(get_db),
    _api_key: str = Depends(verify_admin_api_key)
):
    """Récupère les statistiques des notifications pour un événement (CMS) - Protégé par API key"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Compter par statut
    total = db.query(PushNotification).filter(
        PushNotification.event_id == event_id
    ).count()
    
    sent = db.query(PushNotification).filter(
        PushNotification.event_id == event_id,
        PushNotification.status == 'sent'
    ).count()
    
    scheduled = db.query(PushNotification).filter(
        PushNotification.event_id == event_id,
        PushNotification.status == 'scheduled'
    ).count()
    
    failed = db.query(PushNotification).filter(
        PushNotification.event_id == event_id,
        PushNotification.status == 'failed'
    ).count()
    
    # Quota (pack Essentiel = 5, autres = illimité)
    quota_limit = 5 if event.pack == 'essential' else None
    
    return {
        "total": total,
        "sent": sent,
        "scheduled": scheduled,
        "failed": failed,
        "firebase_available": is_firebase_available(),
        "quota": {
            "used": sent,
            "limit": quota_limit,
            "remaining": (quota_limit - sent) if quota_limit else None
        }
    }
