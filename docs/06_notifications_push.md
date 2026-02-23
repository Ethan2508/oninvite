# ÉTAPE 6 — Notifications Push

> **Statut** : À implémenter
> **Prérequis** : Étape 5 (CMS Back-Office)
> **Livrable** : Système de notifications push fonctionnel (envoi + programmation)

---

## 1. PROVIDER

**Firebase Cloud Messaging (FCM)** — gratuit, fonctionne sur iOS et Android.

---

## 2. SETUP FIREBASE

### Architecture recommandée

**Un seul projet Firebase**, chaque événement = un topic FCM (`event_{event_id}`)

Avantages :
- Gestion centralisée
- Une seule configuration
- L'app s'abonne au topic de son événement

### Configuration côté Firebase

1. Créer un projet Firebase : `savethedate-prod`
2. Activer Cloud Messaging
3. Télécharger les credentials :
   - `google-services.json` pour Android
   - `GoogleService-Info.plist` pour iOS
4. Générer une clé de service pour l'API Admin (fichier JSON)

---

## 3. CONFIGURATION APP MOBILE

### Installation des dépendances

```bash
# React Native
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Initialisation et abonnement au topic

```javascript
// services/NotificationService.js
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

const EVENT_ID = process.env.EVENT_ID;

export const initializeNotifications = async () => {
  // Demander la permission (iOS uniquement)
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    if (
      authStatus !== messaging.AuthorizationStatus.AUTHORIZED &&
      authStatus !== messaging.AuthorizationStatus.PROVISIONAL
    ) {
      console.log('Notifications permission denied');
      return false;
    }
  }

  // S'abonner au topic de l'événement
  await messaging().subscribeToTopic(`event_${EVENT_ID}`);
  console.log(`Subscribed to topic: event_${EVENT_ID}`);

  // Récupérer le token FCM (pour debug)
  const token = await messaging().getToken();
  console.log('FCM Token:', token);

  return true;
};

// Gérer les notifications en foreground
export const setupForegroundHandler = (onNotification) => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Notification received in foreground:', remoteMessage);
    onNotification(remoteMessage);
  });
};

// Gérer les notifications en background
export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Notification received in background:', remoteMessage);
    // Le système affiche automatiquement la notification
  });
};
```

### Utilisation dans App.tsx

```javascript
// App.tsx
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  initializeNotifications, 
  setupForegroundHandler,
  setupBackgroundHandler 
} from './services/NotificationService';

const App = () => {
  useEffect(() => {
    // Initialiser les notifications
    initializeNotifications();

    // Handler pour les notifs en foreground
    const unsubscribe = setupForegroundHandler((message) => {
      Alert.alert(
        message.notification?.title || 'Notification',
        message.notification?.body || ''
      );
    });

    // Handler pour les notifs en background
    setupBackgroundHandler();

    return () => unsubscribe();
  }, []);

  // ... reste de l'app
};
```

---

## 4. ENVOI DEPUIS LE BACKEND

### Installation Firebase Admin SDK

```bash
# Python
pip install firebase-admin

# Node.js
npm install firebase-admin
```

### Service d'envoi (Node.js)

```javascript
// api/services/notificationService.js
const admin = require('firebase-admin');

// Initialiser une seule fois
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_CREDENTIALS)
    ),
  });
}

/**
 * Envoyer une notification push à tous les appareils d'un événement
 */
const sendPushNotification = async (eventId, title, body, data = {}) => {
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      eventId,
      ...data,
    },
    topic: `event_${eventId}`,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer une notification à un appareil spécifique (via token)
 */
const sendToDevice = async (token, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    data,
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendPushNotification, sendToDevice };
```

### Service d'envoi (Python/Django)

```python
# api/notifications/services.py
import firebase_admin
from firebase_admin import credentials, messaging
import os
import json

# Initialiser Firebase Admin
cred_json = json.loads(os.environ.get('FIREBASE_CREDENTIALS'))
cred = credentials.Certificate(cred_json)
firebase_admin.initialize_app(cred)


def send_push_notification(event_id: str, title: str, body: str, data: dict = None):
    """
    Envoyer une notification push à tous les appareils d'un événement
    """
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data={
            'event_id': event_id,
            **(data or {})
        },
        topic=f'event_{event_id}',
    )
    
    try:
        response = messaging.send(message)
        return {'success': True, 'message_id': response}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def send_to_device(token: str, title: str, body: str, data: dict = None):
    """
    Envoyer une notification à un appareil spécifique
    """
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        token=token,
    )
    
    try:
        response = messaging.send(message)
        return {'success': True, 'message_id': response}
    except Exception as e:
        return {'success': False, 'error': str(e)}
```

---

## 5. NOTIFICATIONS PROGRAMMÉES

### Architecture

1. L'utilisateur crée une notification dans le CMS avec une date/heure d'envoi
2. La notification est stockée en BDD avec `status = 'scheduled'`
3. Un cron job vérifie toutes les minutes s'il y a des notifications à envoyer
4. Si oui, envoi via FCM + mise à jour du statut en BDD

### Cron job (Node.js avec node-cron)

```javascript
// api/jobs/notificationCron.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendPushNotification } = require('../services/notificationService');

const prisma = new PrismaClient();

// Toutes les minutes
cron.schedule('* * * * *', async () => {
  const now = new Date();
  
  // Récupérer les notifications programmées dont l'heure est passée
  const scheduledNotifications = await prisma.push_notifications.findMany({
    where: {
      status: 'scheduled',
      scheduled_at: { lte: now },
    },
  });

  for (const notification of scheduledNotifications) {
    console.log(`Sending scheduled notification: ${notification.id}`);
    
    const result = await sendPushNotification(
      notification.event_id,
      notification.title,
      notification.message
    );

    // Mettre à jour le statut
    await prisma.push_notifications.update({
      where: { id: notification.id },
      data: {
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? now : null,
      },
    });
  }
});
```

### Cron job (Python avec Celery)

```python
# api/notifications/tasks.py
from celery import shared_task
from datetime import datetime
from .models import PushNotification
from .services import send_push_notification


@shared_task
def process_scheduled_notifications():
    """
    Exécuté toutes les minutes par Celery Beat
    """
    now = datetime.now()
    
    notifications = PushNotification.objects.filter(
        status='scheduled',
        scheduled_at__lte=now
    )
    
    for notification in notifications:
        result = send_push_notification(
            event_id=str(notification.event_id),
            title=notification.title,
            body=notification.message
        )
        
        if result['success']:
            notification.status = 'sent'
            notification.sent_at = now
        else:
            notification.status = 'failed'
        
        notification.save()
```

### Configuration Celery Beat

```python
# celery.py
CELERY_BEAT_SCHEDULE = {
    'process-scheduled-notifications': {
        'task': 'notifications.tasks.process_scheduled_notifications',
        'schedule': 60.0,  # Toutes les 60 secondes
    },
}
```

---

## 6. ENDPOINTS API NOTIFICATIONS

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/notifications` | Créer une notification (immédiate ou programmée) |
| GET | `/api/events/{id}/notifications` | Liste des notifications (pour le CMS) |
| GET | `/api/events/{id}/notifications/{notif_id}` | Détail d'une notification |
| DELETE | `/api/events/{id}/notifications/{notif_id}` | Annuler une notification programmée |

### Exemple d'endpoint (Node.js)

```javascript
// api/routes/notifications.js
const express = require('express');
const router = express.Router();
const { sendPushNotification } = require('../services/notificationService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Créer et envoyer une notification
router.post('/events/:eventId/notifications', async (req, res) => {
  const { eventId } = req.params;
  const { title, message, scheduled_at } = req.body;

  // Créer en BDD
  const notification = await prisma.push_notifications.create({
    data: {
      event_id: eventId,
      title,
      message,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      status: scheduled_at ? 'scheduled' : 'draft',
    },
  });

  // Si pas de date programmée, envoyer immédiatement
  if (!scheduled_at) {
    const result = await sendPushNotification(eventId, title, message);
    
    await prisma.push_notifications.update({
      where: { id: notification.id },
      data: {
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date() : null,
      },
    });

    return res.json({ 
      success: result.success, 
      notification,
      messageId: result.messageId 
    });
  }

  res.json({ success: true, notification, scheduled: true });
});

// Liste des notifications d'un événement
router.get('/events/:eventId/notifications', async (req, res) => {
  const { eventId } = req.params;
  
  const notifications = await prisma.push_notifications.findMany({
    where: { event_id: eventId },
    orderBy: { created_at: 'desc' },
  });

  res.json(notifications);
});

module.exports = router;
```

---

## 7. QUOTAS PAR PACK

| Pack | Notifications autorisées |
|------|-------------------------|
| Essentiel | 5 |
| Premium | Illimitées |
| VIP | Illimitées |

### Vérification du quota

```javascript
const checkNotificationQuota = async (eventId) => {
  const event = await prisma.events.findUnique({ where: { id: eventId } });
  
  if (event.pack === 'essential') {
    const sentCount = await prisma.push_notifications.count({
      where: { 
        event_id: eventId, 
        status: 'sent' 
      },
    });
    
    if (sentCount >= 5) {
      throw new Error('Quota de notifications atteint (5/5)');
    }
  }
  
  return true;
};
```

---

## 8. INTERFACE CMS — FORMULAIRE DE NOTIFICATION

```jsx
// cms/components/NotificationForm.tsx
import { useState } from 'react';
import { 
  Input, 
  Textarea, 
  Button, 
  Switch, 
  FormControl, 
  FormLabel 
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';

const NotificationForm = ({ eventId, onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    setIsSending(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          scheduled_at: isScheduled ? scheduledDate.toISOString() : null,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        onSend(result);
        setTitle('');
        setMessage('');
        setScheduledDate(null);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="notification-form">
      <FormControl>
        <FormLabel>Titre</FormLabel>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Rappel important"
          maxLength={50}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Message</FormLabel>
        <Textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: N'oubliez pas de confirmer votre présence !"
          maxLength={200}
        />
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <FormLabel mb="0">Programmer l'envoi</FormLabel>
        <Switch 
          isChecked={isScheduled} 
          onChange={(e) => setIsScheduled(e.target.checked)} 
        />
      </FormControl>

      {isScheduled && (
        <FormControl>
          <FormLabel>Date et heure d'envoi</FormLabel>
          <DatePicker
            selected={scheduledDate}
            onChange={setScheduledDate}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()}
          />
        </FormControl>
      )}

      <Button 
        onClick={handleSubmit} 
        isLoading={isSending}
        colorScheme="blue"
        isDisabled={!title || !message}
      >
        {isScheduled ? 'Programmer' : 'Envoyer maintenant'}
      </Button>
    </div>
  );
};
```

---

## CHECKLIST DE VALIDATION

- [ ] Projet Firebase créé et configuré
- [ ] Credentials Firebase stockés en variables d'environnement
- [ ] App mobile s'abonne au topic de son événement
- [ ] Notifications reçues en foreground (avec alerte)
- [ ] Notifications reçues en background (notification système)
- [ ] Envoi immédiat depuis le CMS fonctionne
- [ ] Notifications programmées fonctionnent (cron job)
- [ ] Quota de 5 notifs respecté pour le pack Essentiel
- [ ] Historique des notifications dans le CMS
- [ ] Statuts corrects (draft, scheduled, sent, failed)

---

> **Étape suivante** : [07_build_et_deploiement.md](07_build_et_deploiement.md)
