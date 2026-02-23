"""
Routes pour la cagnotte (donations)
"""
from typing import List
from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.models import Event, Donation
from core.schemas import (
    DonationCreate, DonationResponse, DonationStats,
    PaymentIntentResponse, SuccessResponse
)

router = APIRouter()


@router.post("/{event_id}/donations", response_model=PaymentIntentResponse)
async def create_donation(
    event_id: UUID,
    donation_data: DonationCreate,
    db: Session = Depends(get_db)
):
    """
    Créer un don (PaymentIntent Stripe)
    
    Note: L'intégration Stripe complète sera ajoutée plus tard.
    Pour l'instant, on simule la création du PaymentIntent.
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier que le module cagnotte est activé
    donation_config = event.config.get('modules', {}).get('donation', {})
    if not donation_config.get('enabled', False):
        raise HTTPException(status_code=403, detail="Donation module is not enabled")
    
    # Vérifier le montant minimum
    min_amount = donation_config.get('min_amount', 1)
    if donation_data.amount < min_amount:
        raise HTTPException(
            status_code=400, 
            detail=f"Minimum donation amount is {min_amount}€"
        )
    
    # TODO: Créer un vrai PaymentIntent Stripe
    # Pour l'instant, on simule
    fake_payment_intent_id = f"pi_simulated_{event_id}_{donation_data.amount}"
    fake_client_secret = f"pi_simulated_secret_{event_id}"
    
    # Créer l'entrée en BDD (status pending)
    donation = Donation(
        event_id=event_id,
        donor_name=None if donation_data.anonymous else donation_data.donor_name,
        amount=donation_data.amount,
        currency=donation_data.currency,
        message=donation_data.message,
        stripe_payment_id=fake_payment_intent_id,
        anonymous=donation_data.anonymous,
        status='pending'
    )
    
    db.add(donation)
    db.commit()
    
    return PaymentIntentResponse(
        client_secret=fake_client_secret,
        payment_intent_id=fake_payment_intent_id
    )


@router.post("/{event_id}/donations/confirm/{donation_id}", response_model=DonationResponse)
async def confirm_donation(
    event_id: UUID,
    donation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Confirmer un don après paiement réussi
    
    Note: En production, cela serait appelé via webhook Stripe.
    """
    donation = db.query(Donation).filter(
        Donation.id == donation_id,
        Donation.event_id == event_id
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    donation.status = 'completed'
    db.commit()
    db.refresh(donation)
    
    return donation


@router.get("/{event_id}/donations", response_model=List[DonationResponse])
async def list_donations(
    event_id: UUID,
    status: str = Query(None, description="Filtrer par statut"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Liste les dons (CMS)"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(Donation).filter(Donation.event_id == event_id)
    
    if status:
        query = query.filter(Donation.status == status)
    
    donations = query.order_by(Donation.created_at.desc()).offset(skip).limit(limit).all()
    return donations


@router.get("/{event_id}/donations/stats", response_model=DonationStats)
async def get_donation_stats(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Statistiques des dons (CMS)"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Calculer les stats (uniquement les dons complétés)
    result = db.query(
        func.coalesce(func.sum(Donation.amount), 0).label('total'),
        func.count(Donation.id).label('count')
    ).filter(
        Donation.event_id == event_id,
        Donation.status == 'completed'
    ).first()
    
    return DonationStats(
        total_amount=Decimal(str(result.total or 0)),
        total_count=result.count or 0,
        currency='EUR'
    )


@router.delete("/{event_id}/donations/{donation_id}", response_model=SuccessResponse)
async def delete_donation(
    event_id: UUID,
    donation_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprime un don (CMS - admin only)"""
    donation = db.query(Donation).filter(
        Donation.id == donation_id,
        Donation.event_id == event_id
    ).first()
    
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    db.delete(donation)
    db.commit()
    
    return SuccessResponse(message="Donation deleted successfully")
