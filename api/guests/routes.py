"""
Routes pour les invités et RSVPs
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from core.database import get_db
from core.models import Event, Guest, InvitationGroup, GroupSubEvent, SubEvent, GuestSubEventRsvp
from core.schemas import (
    RSVPCreate, GuestUpdate, GuestResponse, 
    RSVPStats, SuccessResponse,
    GuestIdentification, GuestIdentificationResponse,
    PersonalizedProgram, SubEventProgram,
    SubEventRsvpCreate, SubEventRsvpStats,
    GuestImportResult
)

router = APIRouter()


@router.post("/{event_id}/rsvp", response_model=GuestResponse, status_code=201)
async def submit_rsvp(
    event_id: UUID,
    rsvp_data: RSVPCreate,
    db: Session = Depends(get_db)
):
    """
    Soumettre un RSVP (depuis l'app mobile)
    """
    # Récupérer l'événement
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier la deadline RSVP
    rsvp_config = event.config.get('modules', {}).get('rsvp', {})
    deadline_str = rsvp_config.get('deadline')
    
    if deadline_str:
        deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
        if datetime.now(deadline.tzinfo) > deadline:
            raise HTTPException(
                status_code=400, 
                detail="RSVP deadline has passed"
            )
    
    # Vérifier le nombre de +1
    max_plus_ones = rsvp_config.get('max_plus_ones', 0)
    if rsvp_data.plus_ones > max_plus_ones:
        raise HTTPException(
            status_code=400, 
            detail=f"Maximum {max_plus_ones} plus ones allowed"
        )
    
    # Créer l'invité
    guest = Guest(
        event_id=event_id,
        name=rsvp_data.name,
        email=rsvp_data.email,
        phone=rsvp_data.phone,
        status='confirmed' if rsvp_data.attending else 'declined',
        plus_ones=rsvp_data.plus_ones if rsvp_data.attending else 0,
        plus_one_names=rsvp_data.plus_one_names if rsvp_data.attending else [],
        dietary=rsvp_data.dietary,
        allergies=rsvp_data.allergies,
        menu_choice=rsvp_data.menu_choice,
        custom_answers=rsvp_data.custom_answers,
        rsvp_date=datetime.utcnow()
    )
    
    db.add(guest)
    db.commit()
    db.refresh(guest)
    
    return guest


@router.get("/{event_id}/guests", response_model=List[GuestResponse])
async def list_guests(
    event_id: UUID,
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Liste les invités d'un événement (CMS)"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(Guest).filter(Guest.event_id == event_id)
    
    if status:
        query = query.filter(Guest.status == status)
    
    guests = query.order_by(Guest.created_at.desc()).offset(skip).limit(limit).all()
    return guests


@router.get("/{event_id}/rsvp/stats", response_model=RSVPStats)
async def get_rsvp_stats(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Statistiques des RSVPs (CMS)"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    guests = db.query(Guest).filter(Guest.event_id == event_id).all()
    
    # Calculer les stats
    total = len(guests)
    confirmed = len([g for g in guests if g.status == 'confirmed'])
    declined = len([g for g in guests if g.status == 'declined'])
    pending = len([g for g in guests if g.status == 'pending'])
    
    # Total avec +1
    total_with_plus_ones = sum(
        1 + (g.plus_ones or 0) for g in guests if g.status == 'confirmed'
    )
    
    # Répartition des régimes alimentaires
    dietary_breakdown = {}
    for g in guests:
        if g.status == 'confirmed' and g.dietary:
            dietary_breakdown[g.dietary] = dietary_breakdown.get(g.dietary, 0) + 1
    
    # Répartition des menus
    menu_breakdown = {}
    for g in guests:
        if g.status == 'confirmed' and g.menu_choice:
            menu_breakdown[g.menu_choice] = menu_breakdown.get(g.menu_choice, 0) + 1
    
    return RSVPStats(
        total=total,
        confirmed=confirmed,
        declined=declined,
        pending=pending,
        total_with_plus_ones=total_with_plus_ones,
        dietary_breakdown=dietary_breakdown,
        menu_breakdown=menu_breakdown
    )


@router.get("/{event_id}/guests/{guest_id}", response_model=GuestResponse)
async def get_guest(
    event_id: UUID,
    guest_id: UUID,
    db: Session = Depends(get_db)
):
    """Récupère un invité par ID"""
    guest = db.query(Guest).filter(
        Guest.id == guest_id,
        Guest.event_id == event_id
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    return guest


@router.put("/{event_id}/guests/{guest_id}", response_model=GuestResponse)
async def update_guest(
    event_id: UUID,
    guest_id: UUID,
    guest_data: GuestUpdate,
    db: Session = Depends(get_db)
):
    """Met à jour un invité (CMS)"""
    guest = db.query(Guest).filter(
        Guest.id == guest_id,
        Guest.event_id == event_id
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    update_data = guest_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(guest, key, value)
    
    db.commit()
    db.refresh(guest)
    
    return guest


@router.delete("/{event_id}/guests/{guest_id}", response_model=SuccessResponse)
async def delete_guest(
    event_id: UUID,
    guest_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprime un invité (CMS)"""
    guest = db.query(Guest).filter(
        Guest.id == guest_id,
        Guest.event_id == event_id
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    db.delete(guest)
    db.commit()
    
    return SuccessResponse(message="Guest deleted successfully")


# ============================================================================
# IDENTIFICATION ET PROGRAMME PERSONNALISÉ
# ============================================================================

def generate_personal_code() -> str:
    """Génère un code personnel unique de 6 caractères"""
    chars = string.ascii_uppercase + string.digits
    # Exclure les caractères ambigus (0, O, I, 1, L)
    chars = chars.replace('0', '').replace('O', '').replace('I', '').replace('1', '').replace('L', '')
    return ''.join(secrets.choice(chars) for _ in range(6))


@router.post("/{event_id}/guests/identify", response_model=GuestIdentificationResponse)
async def identify_guest(
    event_id: UUID,
    data: GuestIdentification,
    db: Session = Depends(get_db)
):
    """
    Identifier un invité par nom, email ou téléphone
    Retourne le personal_code si trouvé
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(Guest).filter(Guest.event_id == event_id)
    
    # Recherche par nom (insensible à la casse)
    if data.name:
        query = query.filter(
            func.lower(Guest.name).contains(func.lower(data.name))
        )
    
    # Affiner avec email ou téléphone si fourni
    if data.email:
        query = query.filter(func.lower(Guest.email) == func.lower(data.email))
    if data.phone:
        # Normaliser le téléphone (supprimer espaces et tirets)
        normalized_phone = data.phone.replace(' ', '').replace('-', '').replace('.', '')
        query = query.filter(
            func.replace(func.replace(Guest.phone, ' ', ''), '-', '').contains(normalized_phone)
        )
    
    guests = query.all()
    
    if len(guests) == 0:
        return GuestIdentificationResponse(
            found=False,
            message="Votre nom n'a pas été trouvé. Vérifiez l'orthographe ou contactez les mariés."
        )
    
    if len(guests) > 1:
        return GuestIdentificationResponse(
            found=False,
            multiple_matches=True,
            message=f"{len(guests)} personnes correspondent. Veuillez préciser avec votre email ou téléphone."
        )
    
    guest = guests[0]
    
    # Générer un personal_code si pas encore fait
    if not guest.personal_code:
        while True:
            code = generate_personal_code()
            existing = db.query(Guest).filter(Guest.personal_code == code).first()
            if not existing:
                guest.personal_code = code
                db.commit()
                break
    
    return GuestIdentificationResponse(
        found=True,
        personal_code=guest.personal_code,
        guest_name=guest.name,
        message="Bienvenue !"
    )


@router.get("/{event_id}/guests/code/{personal_code}", response_model=GuestResponse)
async def get_guest_by_code(
    event_id: UUID,
    personal_code: str,
    db: Session = Depends(get_db)
):
    """Récupère un invité par son code personnel"""
    guest = db.query(Guest).filter(
        Guest.event_id == event_id,
        Guest.personal_code == personal_code.upper()
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    return guest


@router.get("/{event_id}/guests/{personal_code}/program", response_model=PersonalizedProgram)
async def get_personalized_program(
    event_id: UUID,
    personal_code: str,
    db: Session = Depends(get_db)
):
    """
    Récupère le programme personnalisé d'un invité
    Basé sur son groupe d'invitation
    """
    # Trouver l'invité par son code personnel
    guest = db.query(Guest).filter(
        Guest.event_id == event_id,
        Guest.personal_code == personal_code.upper()
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    # Récupérer l'événement pour la deadline RSVP
    event = db.query(Event).filter(Event.id == event_id).first()
    rsvp_config = event.config.get('modules', {}).get('rsvp', {}) if event else {}
    rsvp_deadline = rsvp_config.get('deadline')
    
    # Si l'invité n'a pas de groupe, retourner tous les sous-événements publics
    if not guest.invitation_group_id:
        sub_events = (
            db.query(SubEvent)
            .filter(SubEvent.event_id == event_id)
            .order_by(SubEvent.sort_order, SubEvent.date)
            .all()
        )
        group_name = "Invité"
    else:
        # Récupérer le groupe de l'invité
        group = db.query(InvitationGroup).filter(
            InvitationGroup.id == guest.invitation_group_id
        ).first()
        group_name = group.name if group else "Invité"
        
        # Récupérer les sous-événements du groupe
        sub_events = (
            db.query(SubEvent)
            .join(GroupSubEvent, GroupSubEvent.sub_event_id == SubEvent.id)
            .filter(GroupSubEvent.group_id == guest.invitation_group_id)
            .order_by(SubEvent.sort_order, SubEvent.date)
            .all()
        )
    
    # Récupérer les RSVP par sous-événement
    rsvp_map = {}
    rsvps = db.query(GuestSubEventRsvp).filter(
        GuestSubEventRsvp.guest_id == guest.id
    ).all()
    for rsvp in rsvps:
        rsvp_map[str(rsvp.sub_event_id)] = {
            "status": rsvp.status,
            "attendees_count": rsvp.attendees_count
        }
    
    # Construire la réponse
    program_items = []
    for se in sub_events:
        rsvp_info = rsvp_map.get(str(se.id), {"status": "pending", "attendees_count": 1})
        program_items.append(SubEventProgram(
            slug=se.slug,
            name=se.name,
            date=se.date.strftime("%Y-%m-%d") if se.date else None,
            start_time=se.start_time,
            end_time=se.end_time,
            location_name=se.location_name,
            location_address=se.location_address,
            latitude=float(se.latitude) if se.latitude else None,
            longitude=float(se.longitude) if se.longitude else None,
            dress_code=se.dress_code,
            notes=se.notes,
            rsvp_status=rsvp_info["status"],
            attendees_count=rsvp_info["attendees_count"]
        ))
    
    # Déterminer le statut global
    if all(r.status == 'confirmed' for r in rsvps) and rsvps:
        global_status = 'confirmed'
    elif all(r.status == 'declined' for r in rsvps) and rsvps:
        global_status = 'declined'
    elif any(r.status != 'pending' for r in rsvps):
        global_status = 'partial'
    else:
        global_status = 'pending'
    
    return PersonalizedProgram(
        guest_id=guest.id,
        guest_name=guest.name,
        first_name=guest.first_name,
        group_name=group_name,
        sub_events=program_items,
        rsvp_deadline=datetime.fromisoformat(rsvp_deadline.replace('Z', '+00:00')) if rsvp_deadline else None,
        global_rsvp_status=global_status
    )


@router.post("/{event_id}/guests/{personal_code}/rsvp", response_model=SuccessResponse)
async def submit_sub_event_rsvp(
    event_id: UUID,
    personal_code: str,
    data: SubEventRsvpCreate,
    db: Session = Depends(get_db)
):
    """
    Soumettre un RSVP par sous-événements
    """
    # Trouver l'invité
    guest = db.query(Guest).filter(
        Guest.event_id == event_id,
        Guest.personal_code == personal_code.upper()
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    # Mettre à jour les infos générales
    if data.dietary:
        guest.dietary = data.dietary
    if data.allergies:
        guest.allergies = data.allergies
    if data.custom_answers:
        guest.custom_answers = data.custom_answers
    guest.rsvp_date = datetime.utcnow()
    
    # Traiter chaque sous-événement
    for item in data.sub_event_rsvps:
        # Vérifier que le sous-événement existe
        sub_event = db.query(SubEvent).filter(
            SubEvent.id == item.sub_event_id,
            SubEvent.event_id == event_id
        ).first()
        
        if not sub_event:
            continue
        
        # Chercher un RSVP existant
        existing_rsvp = db.query(GuestSubEventRsvp).filter(
            GuestSubEventRsvp.guest_id == guest.id,
            GuestSubEventRsvp.sub_event_id == item.sub_event_id
        ).first()
        
        if existing_rsvp:
            existing_rsvp.status = item.status
            existing_rsvp.attendees_count = item.attendees_count
        else:
            new_rsvp = GuestSubEventRsvp(
                guest_id=guest.id,
                sub_event_id=item.sub_event_id,
                status=item.status,
                attendees_count=item.attendees_count
            )
            db.add(new_rsvp)
    
    # Mettre à jour le statut global de l'invité
    all_rsvps = db.query(GuestSubEventRsvp).filter(
        GuestSubEventRsvp.guest_id == guest.id
    ).all()
    
    if all(r.status == 'confirmed' for r in all_rsvps) and all_rsvps:
        guest.status = 'confirmed'
    elif all(r.status == 'declined' for r in all_rsvps) and all_rsvps:
        guest.status = 'declined'
    elif any(r.status != 'pending' for r in all_rsvps):
        guest.status = 'partial'
    
    db.commit()
    
    return SuccessResponse(message="RSVP submitted successfully")


@router.post("/{event_id}/guests/generate-codes", response_model=SuccessResponse)
async def generate_personal_codes(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Génère des codes personnels pour tous les invités qui n'en ont pas"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    guests = db.query(Guest).filter(
        Guest.event_id == event_id,
        Guest.personal_code == None
    ).all()
    
    generated = 0
    for guest in guests:
        while True:
            code = generate_personal_code()
            existing = db.query(Guest).filter(Guest.personal_code == code).first()
            if not existing:
                guest.personal_code = code
                generated += 1
                break
    
    db.commit()
    
    return SuccessResponse(message=f"{generated} codes generated")


@router.get("/{event_id}/rsvp/stats/sub-events", response_model=List[SubEventRsvpStats])
async def get_sub_event_rsvp_stats(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Statistiques RSVP par sous-événement"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    sub_events = db.query(SubEvent).filter(
        SubEvent.event_id == event_id
    ).all()
    
    stats = []
    for se in sub_events:
        rsvps = db.query(GuestSubEventRsvp).filter(
            GuestSubEventRsvp.sub_event_id == se.id
        ).all()
        
        confirmed = sum(1 for r in rsvps if r.status == 'confirmed')
        declined = sum(1 for r in rsvps if r.status == 'declined')
        pending = sum(1 for r in rsvps if r.status == 'pending')
        total_attendees = sum(r.attendees_count for r in rsvps if r.status == 'confirmed')
        
        stats.append(SubEventRsvpStats(
            sub_event_id=se.id,
            sub_event_name=se.name,
            confirmed=confirmed,
            declined=declined,
            pending=pending,
            total_attendees=total_attendees
        ))
    
    return stats

