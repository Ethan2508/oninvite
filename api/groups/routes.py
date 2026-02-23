"""
Routes pour les groupes d'invitation
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from core.database import get_db
from core.models import Event, InvitationGroup, GroupSubEvent, SubEvent, Guest
from core.schemas import (
    InvitationGroupCreate, InvitationGroupUpdate, InvitationGroupResponse,
    GroupSubEventsUpdate, SubEventResponse, SuccessResponse
)

router = APIRouter()

# Templates de groupes d'invitation
GROUP_TEMPLATES = [
    {
        "name": "Full invitation",
        "description": "Invités à tous les événements",
        "color": "#22C55E",  # Vert
        "default_all": True
    },
    {
        "name": "Cérémonie + Soirée",
        "description": "Invités à la cérémonie et à la soirée",
        "color": "#3B82F6",  # Bleu
        "default_slugs": ["mairie", "houppa", "party"]
    },
    {
        "name": "Soirée uniquement",
        "description": "Invités uniquement à la soirée",
        "color": "#F59E0B",  # Orange
        "default_slugs": ["party"]
    },
    {
        "name": "Cérémonie uniquement",
        "description": "Invités uniquement à la cérémonie",
        "color": "#8B5CF6",  # Violet
        "default_slugs": ["mairie", "houppa"]
    },
]


@router.get("/templates")
async def get_group_templates():
    """Retourne les templates de groupes disponibles"""
    return GROUP_TEMPLATES


def build_group_response(group: InvitationGroup, db: Session) -> dict:
    """Construit la réponse d'un groupe avec ses sous-événements"""
    # Récupérer les sous-événements liés
    sub_events = (
        db.query(SubEvent)
        .join(GroupSubEvent, GroupSubEvent.sub_event_id == SubEvent.id)
        .filter(GroupSubEvent.group_id == group.id)
        .order_by(SubEvent.sort_order, SubEvent.date)
        .all()
    )
    
    # Compter les invités du groupe
    guest_count = db.query(func.count(Guest.id)).filter(
        Guest.invitation_group_id == group.id
    ).scalar()
    
    return {
        "id": group.id,
        "event_id": group.event_id,
        "name": group.name,
        "description": group.description,
        "color": group.color,
        "sub_events": sub_events,
        "guest_count": guest_count or 0,
        "created_at": group.created_at
    }


@router.post("/{event_id}/groups", response_model=InvitationGroupResponse, status_code=201)
async def create_group(
    event_id: UUID,
    group_data: InvitationGroupCreate,
    db: Session = Depends(get_db)
):
    """Créer un groupe d'invitation"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Créer le groupe
    group = InvitationGroup(
        event_id=event_id,
        name=group_data.name,
        description=group_data.description,
        color=group_data.color
    )
    
    db.add(group)
    db.commit()
    db.refresh(group)
    
    # Associer les sous-événements si fournis
    if group_data.sub_event_ids:
        for sub_event_id in group_data.sub_event_ids:
            # Vérifier que le sous-événement appartient au même événement
            sub_event = db.query(SubEvent).filter(
                SubEvent.id == sub_event_id,
                SubEvent.event_id == event_id
            ).first()
            
            if sub_event:
                link = GroupSubEvent(group_id=group.id, sub_event_id=sub_event_id)
                db.add(link)
        
        db.commit()
    
    return build_group_response(group, db)


@router.get("/{event_id}/groups", response_model=List[InvitationGroupResponse])
async def list_groups(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Liste les groupes d'invitation d'un événement"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    groups = (
        db.query(InvitationGroup)
        .filter(InvitationGroup.event_id == event_id)
        .order_by(InvitationGroup.created_at)
        .all()
    )
    
    return [build_group_response(g, db) for g in groups]


@router.get("/{event_id}/groups/{group_id}", response_model=InvitationGroupResponse)
async def get_group(
    event_id: UUID,
    group_id: UUID,
    db: Session = Depends(get_db)
):
    """Récupère un groupe d'invitation"""
    group = (
        db.query(InvitationGroup)
        .filter(InvitationGroup.id == group_id, InvitationGroup.event_id == event_id)
        .first()
    )
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return build_group_response(group, db)


@router.put("/{event_id}/groups/{group_id}", response_model=InvitationGroupResponse)
async def update_group(
    event_id: UUID,
    group_id: UUID,
    update_data: InvitationGroupUpdate,
    db: Session = Depends(get_db)
):
    """Modifier un groupe d'invitation"""
    group = (
        db.query(InvitationGroup)
        .filter(InvitationGroup.id == group_id, InvitationGroup.event_id == event_id)
        .first()
    )
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Appliquer les mises à jour (sauf sub_event_ids)
    update_dict = update_data.model_dump(exclude_unset=True, exclude={'sub_event_ids'})
    for field, value in update_dict.items():
        setattr(group, field, value)
    
    # Mettre à jour les sous-événements si fournis
    if update_data.sub_event_ids is not None:
        # Supprimer les liens existants
        db.query(GroupSubEvent).filter(GroupSubEvent.group_id == group_id).delete()
        
        # Créer les nouveaux liens
        for sub_event_id in update_data.sub_event_ids:
            sub_event = db.query(SubEvent).filter(
                SubEvent.id == sub_event_id,
                SubEvent.event_id == event_id
            ).first()
            
            if sub_event:
                link = GroupSubEvent(group_id=group_id, sub_event_id=sub_event_id)
                db.add(link)
    
    db.commit()
    db.refresh(group)
    
    return build_group_response(group, db)


@router.delete("/{event_id}/groups/{group_id}", response_model=SuccessResponse)
async def delete_group(
    event_id: UUID,
    group_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprimer un groupe d'invitation"""
    group = (
        db.query(InvitationGroup)
        .filter(InvitationGroup.id == group_id, InvitationGroup.event_id == event_id)
        .first()
    )
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Mettre les invités du groupe à NULL (ne pas les supprimer)
    db.query(Guest).filter(Guest.invitation_group_id == group_id).update(
        {"invitation_group_id": None}
    )
    
    db.delete(group)
    db.commit()
    
    return SuccessResponse(message="Group deleted successfully")


@router.post("/{event_id}/groups/{group_id}/sub-events", response_model=SuccessResponse)
async def add_sub_events_to_group(
    event_id: UUID,
    group_id: UUID,
    data: GroupSubEventsUpdate,
    db: Session = Depends(get_db)
):
    """Associer des sous-événements à un groupe"""
    group = (
        db.query(InvitationGroup)
        .filter(InvitationGroup.id == group_id, InvitationGroup.event_id == event_id)
        .first()
    )
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    added = 0
    for sub_event_id in data.sub_event_ids:
        # Vérifier que le sous-événement existe et appartient au même événement
        sub_event = db.query(SubEvent).filter(
            SubEvent.id == sub_event_id,
            SubEvent.event_id == event_id
        ).first()
        
        if not sub_event:
            continue
        
        # Vérifier si le lien existe déjà
        existing = db.query(GroupSubEvent).filter(
            GroupSubEvent.group_id == group_id,
            GroupSubEvent.sub_event_id == sub_event_id
        ).first()
        
        if not existing:
            link = GroupSubEvent(group_id=group_id, sub_event_id=sub_event_id)
            db.add(link)
            added += 1
    
    db.commit()
    
    return SuccessResponse(message=f"{added} sub-events added to group")


@router.delete("/{event_id}/groups/{group_id}/sub-events/{sub_event_id}", response_model=SuccessResponse)
async def remove_sub_event_from_group(
    event_id: UUID,
    group_id: UUID,
    sub_event_id: UUID,
    db: Session = Depends(get_db)
):
    """Retirer un sous-événement d'un groupe"""
    link = db.query(GroupSubEvent).filter(
        GroupSubEvent.group_id == group_id,
        GroupSubEvent.sub_event_id == sub_event_id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    db.delete(link)
    db.commit()
    
    return SuccessResponse(message="Sub-event removed from group")


@router.put("/{event_id}/guests/{guest_id}/group", response_model=SuccessResponse)
async def assign_guest_to_group(
    event_id: UUID,
    guest_id: UUID,
    group_id: UUID,
    db: Session = Depends(get_db)
):
    """Assigner un invité à un groupe"""
    guest = db.query(Guest).filter(
        Guest.id == guest_id,
        Guest.event_id == event_id
    ).first()
    
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    # Vérifier que le groupe existe (ou null pour retirer du groupe)
    if group_id:
        group = db.query(InvitationGroup).filter(
            InvitationGroup.id == group_id,
            InvitationGroup.event_id == event_id
        ).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
    
    guest.invitation_group_id = group_id
    db.commit()
    
    return SuccessResponse(message="Guest assigned to group")
