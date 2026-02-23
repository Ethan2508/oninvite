"""
Service Firebase Cloud Messaging (FCM) pour les notifications push
"""
import os
import json
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

# Variable globale pour stocker l'app Firebase initialisée
_firebase_app = None


def _get_firebase_app():
    """
    Initialise et retourne l'app Firebase Admin.
    N'initialise qu'une seule fois (singleton).
    """
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        # Vérifier si Firebase est déjà initialisé
        try:
            _firebase_app = firebase_admin.get_app()
            return _firebase_app
        except ValueError:
            pass
        
        # Récupérer les credentials depuis la variable d'environnement
        firebase_creds = os.environ.get('FIREBASE_CREDENTIALS')
        
        if not firebase_creds:
            logger.warning("FIREBASE_CREDENTIALS not set - Firebase disabled")
            return None
        
        # Parser le JSON
        cred_dict = json.loads(firebase_creds)
        cred = credentials.Certificate(cred_dict)
        
        # Initialiser Firebase
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
        
        return _firebase_app
        
    except ImportError:
        logger.error("firebase-admin not installed")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Invalid FIREBASE_CREDENTIALS JSON: {e}")
        return None
    except Exception as e:
        logger.error(f"Firebase initialization error: {e}")
        return None


def is_firebase_available() -> bool:
    """Vérifie si Firebase est configuré et disponible"""
    return _get_firebase_app() is not None


def send_to_topic(
    topic: str,
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Envoie une notification à tous les appareils abonnés à un topic.
    
    Args:
        topic: Nom du topic (ex: "event_evt_xxx")
        title: Titre de la notification
        body: Corps du message
        data: Données additionnelles (optionnel)
    
    Returns:
        Dict avec success (bool) et message_id ou error
    """
    if not is_firebase_available():
        logger.warning("Firebase not available - notification not sent")
        return {
            "success": False,
            "error": "Firebase not configured",
            "simulated": True
        }
    
    try:
        from firebase_admin import messaging
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            topic=topic,
        )
        
        response = messaging.send(message)
        logger.info(f"Notification sent to topic {topic}: {response}")
        
        return {
            "success": True,
            "message_id": response
        }
        
    except Exception as e:
        logger.error(f"Error sending notification to topic {topic}: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def send_to_event(
    event_id: str,
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Envoie une notification à tous les utilisateurs d'un événement.
    Wrapper autour de send_to_topic avec le format du topic.
    
    Args:
        event_id: ID de l'événement
        title: Titre de la notification
        body: Corps du message
        data: Données additionnelles
    
    Returns:
        Dict avec le résultat de l'envoi
    """
    topic = f"event_{event_id}"
    
    # Ajouter l'event_id aux données
    full_data = {"event_id": str(event_id)}
    if data:
        full_data.update(data)
    
    return send_to_topic(topic, title, body, full_data)


def send_to_device(
    token: str,
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Envoie une notification à un appareil spécifique via son token FCM.
    
    Args:
        token: Token FCM de l'appareil
        title: Titre de la notification
        body: Corps du message
        data: Données additionnelles
    
    Returns:
        Dict avec success (bool) et message_id ou error
    """
    if not is_firebase_available():
        return {
            "success": False,
            "error": "Firebase not configured",
            "simulated": True
        }
    
    try:
        from firebase_admin import messaging
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        
        response = messaging.send(message)
        logger.info(f"Notification sent to device: {response}")
        
        return {
            "success": True,
            "message_id": response
        }
        
    except Exception as e:
        logger.error(f"Error sending notification to device: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def send_to_devices(
    tokens: List[str],
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Envoie une notification à plusieurs appareils.
    
    Args:
        tokens: Liste de tokens FCM
        title: Titre de la notification
        body: Corps du message
        data: Données additionnelles
    
    Returns:
        Dict avec le nombre de succès et échecs
    """
    if not is_firebase_available():
        return {
            "success": False,
            "error": "Firebase not configured",
            "simulated": True
        }
    
    if not tokens:
        return {
            "success": True,
            "sent": 0,
            "failed": 0
        }
    
    try:
        from firebase_admin import messaging
        
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            tokens=tokens,
        )
        
        response = messaging.send_each_for_multicast(message)
        
        logger.info(
            f"Multicast sent: {response.success_count} success, "
            f"{response.failure_count} failed"
        )
        
        return {
            "success": True,
            "sent": response.success_count,
            "failed": response.failure_count
        }
        
    except Exception as e:
        logger.error(f"Error sending multicast notification: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def subscribe_to_topic(tokens: List[str], topic: str) -> Dict[str, Any]:
    """
    Abonne des appareils à un topic.
    
    Args:
        tokens: Liste de tokens FCM
        topic: Nom du topic
    
    Returns:
        Dict avec le résultat
    """
    if not is_firebase_available():
        return {"success": False, "error": "Firebase not configured"}
    
    try:
        from firebase_admin import messaging
        
        response = messaging.subscribe_to_topic(tokens, topic)
        
        return {
            "success": True,
            "subscribed": response.success_count,
            "failed": response.failure_count
        }
        
    except Exception as e:
        logger.error(f"Error subscribing to topic {topic}: {e}")
        return {"success": False, "error": str(e)}


def unsubscribe_from_topic(tokens: List[str], topic: str) -> Dict[str, Any]:
    """
    Désabonne des appareils d'un topic.
    
    Args:
        tokens: Liste de tokens FCM
        topic: Nom du topic
    
    Returns:
        Dict avec le résultat
    """
    if not is_firebase_available():
        return {"success": False, "error": "Firebase not configured"}
    
    try:
        from firebase_admin import messaging
        
        response = messaging.unsubscribe_from_topic(tokens, topic)
        
        return {
            "success": True,
            "unsubscribed": response.success_count,
            "failed": response.failure_count
        }
        
    except Exception as e:
        logger.error(f"Error unsubscribing from topic {topic}: {e}")
        return {"success": False, "error": str(e)}
