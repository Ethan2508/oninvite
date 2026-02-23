"""
Script principal pour les jobs en arrière-plan

Gère :
- Notifications programmées (chaque minute)
- Lifecycle des événements (une fois par jour)

Usage:
    python -m scripts.run_jobs
"""
import sys
import time
import logging
import schedule
from datetime import datetime

# Configurer le logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def run_notification_job():
    """Envoie les notifications programmées."""
    try:
        from notifications.scheduler import process_scheduled_notifications
        process_scheduled_notifications()
    except Exception as e:
        logger.error(f"Notification job error: {e}")


def run_lifecycle_job():
    """Gère le cycle de vie des événements."""
    try:
        from scripts.lifecycle_job import run_lifecycle_job as lifecycle
        lifecycle()
    except Exception as e:
        logger.error(f"Lifecycle job error: {e}")


def main():
    logger.info("Starting SaveTheDate background jobs...")
    
    # Planifier les jobs
    schedule.every(1).minutes.do(run_notification_job)
    schedule.every().day.at("02:00").do(run_lifecycle_job)
    
    # Exécuter le job de lifecycle au démarrage
    logger.info("Running initial lifecycle job...")
    run_lifecycle_job()
    
    logger.info("Jobs scheduled:")
    logger.info("  - Notifications: every minute")
    logger.info("  - Lifecycle: daily at 02:00")
    
    # Boucle principale
    while True:
        try:
            schedule.run_pending()
            time.sleep(30)  # Vérifier toutes les 30 secondes
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            break
        except Exception as e:
            logger.error(f"Job runner error: {e}")
            time.sleep(60)  # Attendre avant de réessayer


if __name__ == "__main__":
    main()
