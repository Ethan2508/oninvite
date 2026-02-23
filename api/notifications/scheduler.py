"""
Job pour l'envoi des notifications programmées

Ce script doit être exécuté périodiquement (ex: toutes les minutes via cron)
pour envoyer les notifications dont l'heure est arrivée.

Usage:
    python -m notifications.scheduler

Ou via cron:
    * * * * * cd /app && python -m notifications.scheduler
"""
import os
import sys
import logging
from datetime import datetime

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
from core.models import PushNotification
from notifications.firebase_service import send_to_event


def process_scheduled_notifications():
    """
    Traite toutes les notifications programmées dont l'heure est passée.
    """
    db: Session = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        # Récupérer les notifications programmées prêtes à être envoyées
        scheduled = db.query(PushNotification).filter(
            PushNotification.status == 'scheduled',
            PushNotification.scheduled_at <= now
        ).all()
        
        if not scheduled:
            logger.info("No scheduled notifications to send")
            return 0
        
        sent_count = 0
        
        for notification in scheduled:
            logger.info(
                f"Processing notification {notification.id} "
                f"for event {notification.event_id}"
            )
            
            # Envoyer via Firebase
            result = send_to_event(
                event_id=str(notification.event_id),
                title=notification.title,
                body=notification.message
            )
            
            if result.get("success") or result.get("simulated"):
                notification.status = 'sent'
                notification.sent_at = datetime.utcnow()
                sent_count += 1
                logger.info(f"Notification {notification.id} sent successfully")
            else:
                notification.status = 'failed'
                logger.error(
                    f"Failed to send notification {notification.id}: "
                    f"{result.get('error')}"
                )
            
            db.commit()
        
        logger.info(f"Processed {len(scheduled)} notifications, {sent_count} sent")
        return sent_count
        
    except Exception as e:
        logger.error(f"Error processing scheduled notifications: {e}")
        db.rollback()
        return 0
        
    finally:
        db.close()


def run_scheduler_loop():
    """
    Exécute le scheduler en boucle (pour les environnements sans cron).
    Vérifie toutes les 60 secondes.
    """
    import time
    
    logger.info("Starting notification scheduler loop")
    
    while True:
        try:
            process_scheduled_notifications()
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        
        time.sleep(60)  # Attendre 60 secondes


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Notification scheduler")
    parser.add_argument(
        "--loop",
        action="store_true",
        help="Run in loop mode (for environments without cron)"
    )
    
    args = parser.parse_args()
    
    if args.loop:
        run_scheduler_loop()
    else:
        # Exécution unique (pour cron)
        count = process_scheduled_notifications()
        sys.exit(0 if count >= 0 else 1)
