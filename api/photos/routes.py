"""
Routes pour la galerie photos
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event, Photo
from core.schemas import PhotoResponse, SuccessResponse

router = APIRouter()


@router.post("/{event_id}/photos", response_model=PhotoResponse, status_code=201)
async def upload_photo(
    event_id: UUID,
    uploaded_by: str = Form(None),
    caption: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload une photo (depuis l'app mobile)
    
    Note: L'upload vers Cloudinary sera implémenté plus tard.
    Pour l'instant, on simule avec une URL placeholder.
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier que le module galerie est activé
    gallery_config = event.config.get('modules', {}).get('gallery', {})
    if not gallery_config.get('enabled', False):
        raise HTTPException(status_code=403, detail="Gallery module is not enabled")
    
    # Vérifier si l'upload est autorisé
    if not gallery_config.get('allow_upload', True):
        raise HTTPException(status_code=403, detail="Photo upload is not allowed")
    
    # Vérifier le nombre max de photos par invité
    max_photos = gallery_config.get('max_photos_per_guest')
    if max_photos and uploaded_by:
        current_count = db.query(Photo).filter(
            Photo.event_id == event_id,
            Photo.uploaded_by == uploaded_by
        ).count()
        
        if current_count >= max_photos:
            raise HTTPException(
                status_code=400, 
                detail=f"Maximum {max_photos} photos per guest reached"
            )
    
    # TODO: Upload vers Cloudinary et compression
    # Pour l'instant, on simule
    photo_url = f"https://placeholder.com/photos/{event_id}/{file.filename}"
    thumbnail_url = f"https://placeholder.com/photos/{event_id}/thumb_{file.filename}"
    
    # Déterminer si la photo doit être approuvée automatiquement
    needs_moderation = gallery_config.get('moderation', False)
    
    photo = Photo(
        event_id=event_id,
        uploaded_by=uploaded_by,
        url=photo_url,
        thumbnail_url=thumbnail_url,
        caption=caption,
        approved=not needs_moderation
    )
    
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return photo


@router.get("/{event_id}/photos", response_model=List[PhotoResponse])
async def list_photos(
    event_id: UUID,
    approved_only: bool = Query(True, description="Afficher uniquement les photos approuvées"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Liste les photos d'un événement"""
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    query = db.query(Photo).filter(Photo.event_id == event_id)
    
    if approved_only:
        query = query.filter(Photo.approved == True)
    
    photos = query.order_by(Photo.created_at.desc()).offset(skip).limit(limit).all()
    return photos


@router.get("/{event_id}/photos/{photo_id}", response_model=PhotoResponse)
async def get_photo(
    event_id: UUID,
    photo_id: UUID,
    db: Session = Depends(get_db)
):
    """Récupère une photo par ID"""
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.event_id == event_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return photo


@router.put("/{event_id}/photos/{photo_id}/approve", response_model=PhotoResponse)
async def approve_photo(
    event_id: UUID,
    photo_id: UUID,
    db: Session = Depends(get_db)
):
    """Approuve une photo (CMS)"""
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.event_id == event_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    photo.approved = True
    db.commit()
    db.refresh(photo)
    
    return photo


@router.delete("/{event_id}/photos/{photo_id}", response_model=SuccessResponse)
async def delete_photo(
    event_id: UUID,
    photo_id: UUID,
    db: Session = Depends(get_db)
):
    """Supprime une photo (CMS)"""
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.event_id == event_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # TODO: Supprimer aussi sur Cloudinary
    
    db.delete(photo)
    db.commit()
    
    return SuccessResponse(message="Photo deleted successfully")
