"""
Routes pour le plan de table
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import Event
from core.schemas import SeatingSearchResult

router = APIRouter()


@router.get("/{event_id}/seating", response_model=SeatingSearchResult)
async def search_seating(
    event_id: UUID,
    name: str = Query(..., description="Nom de l'invité à rechercher"),
    db: Session = Depends(get_db)
):
    """
    Recherche de table par nom d'invité (depuis l'app mobile)
    
    L'invité tape son nom, on recherche dans le JSON des tables
    et on lui indique sa table.
    """
    # Vérifier que l'événement existe
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Vérifier que le module plan de table est activé
    seating_config = event.config.get('modules', {}).get('seating_plan', {})
    if not seating_config.get('enabled', False):
        raise HTTPException(status_code=403, detail="Seating plan module is not enabled")
    
    # Vérifier si le mode interactif est activé
    if not seating_config.get('interactive', False):
        # Mode image statique uniquement
        return SeatingSearchResult(
            found=False,
            message="Consultez le plan de table affiché"
        )
    
    # Rechercher dans les tables
    tables = seating_config.get('tables', [])
    search_name = name.lower().strip()
    
    for table in tables:
        table_name = table.get('name', '')
        guests_list = table.get('guests', [])
        
        for guest in guests_list:
            if search_name in guest.lower():
                return SeatingSearchResult(
                    found=True,
                    table_name=table_name,
                    guest_name=guest,
                    message=f"Vous êtes à la {table_name}"
                )
    
    # Non trouvé
    return SeatingSearchResult(
        found=False,
        message=f"Aucune table trouvée pour '{name}'. Vérifiez l'orthographe ou contactez l'organisateur."
    )
