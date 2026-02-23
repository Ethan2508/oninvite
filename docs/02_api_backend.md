# ÉTAPE 2 — API Backend

> **Statut** : À implémenter
> **Prérequis** : Étape 1 (Architecture & BDD)
> **Livrable** : API REST fonctionnelle avec tous les endpoints

---

## 1. STACK RECOMMANDÉE

- **Django REST Framework** (Python) ou **Express.js** (Node.js)
- **PostgreSQL** pour la persistance
- **Firebase Admin SDK** pour les notifications push
- **Stripe SDK** pour les paiements
- **Cloudinary SDK** pour l'upload de médias

---

## 2. MODULES FONCTIONNELS

### 2.1 RSVP

**Endpoints API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/rsvp` | Soumettre un RSVP |
| GET | `/api/events/{id}/rsvp/stats` | Stats RSVPs (pour le CMS) |
| GET | `/api/events/{id}/guests` | Liste des invités (pour le CMS) |
| PUT | `/api/events/{id}/guests/{guest_id}` | Modifier un invité (CMS) |
| DELETE | `/api/events/{id}/guests/{guest_id}` | Supprimer un invité (CMS) |

**Logique :**
- Vérifier que la deadline n'est pas dépassée
- Vérifier que le nombre de +1 ne dépasse pas `max_plus_ones`
- Envoyer une notif push à l'organisateur quand un RSVP est reçu (optionnel)

---

### 2.2 Galerie photo

**Endpoints API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/photos` | Upload une photo (multipart) |
| GET | `/api/events/{id}/photos` | Liste des photos (paginée) |
| DELETE | `/api/events/{id}/photos/{photo_id}` | Supprimer (CMS / modération) |
| GET | `/api/events/{id}/photos/download` | ZIP de toutes les photos (CMS) |

**Logique :**
- Compresser l'image à la réception
- Générer un thumbnail
- Vérifier `max_photos_per_guest` si défini
- Si modération activée, `approved = false` par défaut

---

### 2.3 Cagnotte

**Intégration Stripe :**
- Chaque événement a un Stripe Connect account (ou on utilise notre compte Stripe avec des metadata)
- L'app appelle notre API qui crée un PaymentIntent Stripe
- Le paiement est traité par Stripe, on stocke la confirmation en BDD
- Dashboard CMS : total collecté, liste des dons, export

**Endpoints API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/donations` | Créer un PaymentIntent |
| GET | `/api/events/{id}/donations` | Liste des dons (CMS) |
| GET | `/api/events/{id}/donations/stats` | Total collecté |

---

### 2.4 Plan de table

Deux modes :
- **Image statique** : l'organisateur upload une image du plan de table
- **Interactif** : l'invité cherche son nom → l'app lui affiche sa table

**Endpoint API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/events/{id}/seating?name=David` | Recherche de table par nom |

L'invité tape son nom, l'app fait un search dans le JSON des tables et affiche "Vous êtes à la Table 5 — Famille Cohen".

---

### 2.5 Livre d'or

Simple CRUD. Les invités postent un message (+ photo optionnelle). Affiché sous forme de feed chronologique.

**Endpoints API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/guestbook` | Poster un message |
| GET | `/api/events/{id}/guestbook` | Liste des messages (paginée) |
| DELETE | `/api/events/{id}/guestbook/{entry_id}` | Supprimer (CMS) |

---

### 2.6 Choix de menu

L'invité sélectionne son menu parmi les options définies dans la config. Lié à son profil RSVP.

**Endpoint API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| PUT | `/api/events/{id}/guests/{guest_id}/menu` | Choisir son menu |
| GET | `/api/events/{id}/menu/stats` | Récap des choix (CMS) |

---

### 2.7 Playlist collaborative

Les invités suggèrent des chansons (titre + artiste).

**Endpoints API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/playlist` | Suggérer une chanson |
| GET | `/api/events/{id}/playlist` | Liste des suggestions |
| DELETE | `/api/events/{id}/playlist/{song_id}` | Supprimer (CMS) |

---

### 2.8 Chat

WebSocket (Socket.io) ou Firebase Realtime Database. Messages en temps réel entre invités.

**Endpoints API :**

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/events/{id}/chat` | Envoyer un message |
| GET | `/api/events/{id}/chat` | Historique des messages |
| WS | `/ws/events/{id}/chat` | Connexion WebSocket temps réel |

---

## 3. ENDPOINT PRINCIPAL — CONFIG

L'endpoint le plus important. L'app l'appelle au lancement pour récupérer toute la configuration.

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/events/{id}/config` | Retourne le JSON complet de l'événement |

**Réponse :** Le `config.json` complet stocké dans la colonne `config` de la table `events`.

---

## 4. STRUCTURE DES DOSSIERS API

```
/api
├── events/                   ← CRUD événements + config
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── guests/                   ← RSVPs
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── photos/                   ← Galerie
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── donations/                ← Cagnotte (Stripe)
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── notifications/            ← Push notifications (Firebase)
│   ├── views.py
│   └── services.py
├── guestbook/                ← Livre d'or
│   ├── views.py
│   └── serializers.py
├── playlist/                 ← Suggestions musicales
│   ├── views.py
│   └── serializers.py
├── chat/                     ← Messages temps réel
│   ├── consumers.py          ← WebSocket consumers
│   └── routing.py
├── core/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── requirements.txt
└── Dockerfile
```

---

## 5. SÉCURITÉ API

- **Toutes les routes protégées par le `event_id`** — un invité ne peut accéder qu'aux données de son événement
- **HTTPS obligatoire** partout
- **Upload photos** : vérifier le type MIME, limiter la taille (max 10MB)
- **Cagnotte** : aucune donnée bancaire stockée chez nous — tout passe par Stripe
- **Pas d'authentification invité** : l'app est ouverte via un lien/QR code. Le RSVP demande juste un nom.

---

## 6. EXEMPLE D'IMPLÉMENTATION (Django)

### views.py — Config endpoint

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Event

@api_view(['GET'])
def get_event_config(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        return Response(event.config)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)
```

### views.py — RSVP endpoint

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Event, Guest
from datetime import datetime

@api_view(['POST'])
def submit_rsvp(request, event_id):
    event = Event.objects.get(id=event_id)
    
    # Vérifier la deadline
    rsvp_config = event.config.get('modules', {}).get('rsvp', {})
    deadline = rsvp_config.get('deadline')
    if deadline and datetime.now() > datetime.fromisoformat(deadline):
        return Response({'error': 'RSVP deadline passed'}, status=400)
    
    # Vérifier le nombre de +1
    plus_ones = request.data.get('plus_ones', 0)
    max_plus_ones = rsvp_config.get('max_plus_ones', 0)
    if plus_ones > max_plus_ones:
        return Response({'error': f'Maximum {max_plus_ones} plus ones allowed'}, status=400)
    
    # Créer l'invité
    guest = Guest.objects.create(
        event=event,
        name=request.data['name'],
        email=request.data.get('email'),
        phone=request.data.get('phone'),
        status='confirmed' if request.data.get('attending') else 'declined',
        plus_ones=plus_ones,
        plus_one_names=request.data.get('plus_one_names', []),
        dietary=request.data.get('dietary'),
        allergies=request.data.get('allergies'),
        custom_answers=request.data.get('custom_answers', {}),
        rsvp_date=datetime.now()
    )
    
    return Response({'success': True, 'guest_id': str(guest.id)})
```

---

## CHECKLIST DE VALIDATION

- [ ] Endpoint `/api/events/{id}/config` retourne le JSON de config
- [ ] RSVP : soumission + validation deadline + validation +1
- [ ] Galerie : upload + compression + thumbnail
- [ ] Cagnotte : intégration Stripe PaymentIntent
- [ ] Livre d'or : CRUD fonctionnel
- [ ] Choix de menu : lié au profil RSVP
- [ ] Playlist : suggestions avec recherche Spotify (optionnel)
- [ ] Chat : WebSocket fonctionnel (si module activé)
- [ ] Tous les endpoints authentifiés par event_id

---

> **Étape suivante** : [03_app_mobile.md](03_app_mobile.md)
