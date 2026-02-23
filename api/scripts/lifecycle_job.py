"""
Job pour la gestion du cycle de vie des événements

Ce script gère :
1. Passage en mode "souvenir" après la date de l'événement
2. Expiration des événements après 12 mois
3. Nettoyage des données expirées

Usage:
    python -m scripts.lifecycle_job

Ou via cron (une fois par jour):
    0 2 * * * cd /app && python -m scripts.lifecycle_job
"""
import os
import sys
import logging
from datetime import datetime, timedelta

# Configurer le logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from core.database import SessionLocal
from core.models import Event, Photo, Guest, GuestbookEntry


def update_event_statuses():
    """
    Met à jour les statuts des événements :
    - live → souvenir : si event_date est passée
    - souvenir → expired : si expires_at est passée (ou 12 mois après event_date)
    """
    db: Session = SessionLocal()
    
    try:
        now = datetime.utcnow()
        updated_count = 0
        
        # 1. Passer les événements "live" en "souvenir" après la date
        events_to_souvenir = db.query(Event).filter(
            Event.status == 'live',
            Event.event_date < now
        ).all()
        
        for event in events_to_souvenir:
            event.status = 'souvenir'
            # Définir l'expiration à 12 mois après l'événement si pas définie
            if not event.expires_at:
                event.expires_at = event.event_date + timedelta(days=365)
            updated_count += 1
            logger.info(f"Event {event.id} ({event.title}) → souvenir")
        
        # 2. Expirer les événements dont expires_at est passée
        events_to_expire = db.query(Event).filter(
            Event.status.in_(['live', 'souvenir']),
            Event.expires_at != None,
            Event.expires_at < now
        ).all()
        
        for event in events_to_expire:
            event.status = 'expired'
            updated_count += 1
            logger.info(f"Event {event.id} ({event.title}) → expired")
        
        db.commit()
        logger.info(f"Updated {updated_count} event(s)")
        return updated_count
        
    except Exception as e:
        logger.error(f"Error updating event statuses: {e}")
        db.rollback()
        return 0
        
    finally:
        db.close()


def cleanup_expired_data(months_after_expiration: int = 3):
    """
    Supprime les données des événements expirés depuis X mois.
    Conserve un résumé mais supprime les données personnelles (RGPD).
    """
    db: Session = SessionLocal()
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=months_after_expiration * 30)
        cleaned_count = 0
        
        # Trouver les événements expirés depuis assez longtemps
        expired_events = db.query(Event).filter(
            Event.status == 'expired',
            Event.expires_at < cutoff_date
        ).all()
        
        for event in expired_events:
            logger.info(f"Cleaning data for expired event {event.id} ({event.title})")
            
            # Supprimer les données personnelles des invités
            for guest in event.guests:
                guest.email = None
                guest.phone = None
                # Conserver le nom pour les stats mais anonymiser si nécessaire
            
            # Supprimer les photos (ou les archiver)
            deleted_photos = db.query(Photo).filter(
                Photo.event_id == event.id
            ).delete()
            
            # Anonymiser les messages du livre d'or
            for entry in event.guestbook_entries:
                entry.author_name = "Anonyme"
            
            cleaned_count += 1
        
        db.commit()
        logger.info(f"Cleaned data for {cleaned_count} expired event(s)")
        return cleaned_count
        
    except Exception as e:
        logger.error(f"Error cleaning expired data: {e}")
        db.rollback()
        return 0
        
    finally:
        db.close()


def send_expiration_reminders():
    """
    Envoie des rappels pour les événements qui vont expirer bientôt.
    """
    db: Session = SessionLocal()
    
    try:
        now = datetime.utcnow()
        reminder_threshold = now + timedelta(days=30)  # 30 jours avant expiration
        
        events_expiring_soon = db.query(Event).filter(
            Event.status == 'souvenir',
            Event.expires_at != None,
            Event.expires_at <= reminder_threshold,
            Event.expires_at > now,
            Event.client_email != None
        ).all()
        
        for event in events_expiring_soon:
            logger.info(
                f"Event {event.id} ({event.title}) expires on {event.expires_at} "
                f"- client: {event.client_email}"
            )
            # TODO: Envoyer un email de rappel au client
            # send_renewal_reminder_email(event)
        
        return len(events_expiring_soon)
        
    except Exception as e:
        logger.error(f"Error sending expiration reminders: {e}")
        return 0
        
    finally:
        db.close()


def run_lifecycle_job():
    """Exécute toutes les tâches de gestion du cycle de vie."""
    logger.info("Starting lifecycle job...")
    
    # 1. Mettre à jour les statuts
    updated = update_event_statuses()
    
    # 2. Envoyer les rappels d'expiration
    reminders = send_expiration_reminders()
    
    # 3. Nettoyer les données expirées (uniquement le 1er du mois)
    if datetime.utcnow().day == 1:
        cleaned = cleanup_expired_data(months_after_expiration=3)
    else:
        cleaned = 0
    
    logger.info(
        f"Lifecycle job completed: {updated} updated, "
        f"{reminders} reminders, {cleaned} cleaned"
    )


if __name__ == "__main__":
    run_lifecycle_job()
