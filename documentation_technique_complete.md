# DOCUMENTATION TECHNIQUE COMPLÈTE — Application Événementielle White-Label

> **Document destiné au développeur**
> Dernière mise à jour : Février 2026
> Ce document couvre l'intégralité du projet : architecture, structure, config, CMS, pipeline de build, déploiement, et process client.

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture globale](#2-architecture-globale)
3. [Application mobile](#3-application-mobile)
4. [Fichier de configuration client (config.json)](#4-fichier-de-configuration-client-configjson)
5. [Back-Office / CMS](#5-back-office--cms)
6. [Base de données](#6-base-de-données)
7. [Gestion des médias](#7-gestion-des-médias)
8. [Notifications push](#8-notifications-push)
9. [Modules fonctionnels](#9-modules-fonctionnels)
10. [Pipeline de build & déploiement stores](#10-pipeline-de-build--déploiement-stores)
11. [Structure du repository Git](#11-structure-du-repository-git)
12. [Versioning & gestion des clients](#12-versioning--gestion-des-clients)
13. [Template Apple-approved](#13-template-apple-approved)
14. [Sécurité & données personnelles](#14-sécurité--données-personnelles)
15. [Process client (workflow opérationnel)](#15-process-client-workflow-opérationnel)
16. [Environnements](#16-environnements)
17. [Checklist de livraison](#17-checklist-de-livraison)
18. [FAQ technique](#18-faq-technique)

---

## 1. VUE D'ENSEMBLE DU PROJET

### Concept

On vend une application mobile d'événement (mariage, bar mitzvah, brit mila, baptême, anniversaire, etc.) personnalisée pour chaque client. L'app est publiée sur l'App Store et le Play Store avec le branding du client (nom, icône, logo, couleurs).

### Principe fondamental

**Un seul codebase, zéro modification de code entre deux clients.** Tout ce qui change entre deux clients est externalisé dans un fichier de configuration + des assets (images). Le code source de l'app est strictement identique pour tous les clients.

### Ce que le client obtient

- Une app native sur l'App Store et le Play Store à son nom
- Son logo, ses couleurs, ses textes
- Les modules qu'il a choisis (RSVP, galerie, cagnotte, etc.)
- Des notifications push pour communiquer avec ses invités
- Un QR code et un lien de partage pour distribuer l'app

### Modèle économique

| Pack | Prix | Modules inclus |
|------|------|---------------|
| Essentiel | 490€ | RSVP, infos, countdown, 5 notifs push, QR code, 12 mois hébergement |
| Premium | 790€ | + Galerie photo, cagnotte, plan de table, livre d'or, notifs illimitées, choix menu, mode souvenir |
| VIP | 1 200€ | + Design custom, vidéo intro, playlist collaborative, chat invités, support prioritaire, 24 mois |
| B2B (wedding planners) | 199€/mois | 3 événements inclus, puis 99€/événement supplémentaire, accès CMS self-service |

---

## 2. ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS (Invités)                  │
│                   App iOS / App Android                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS (API REST)
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    SERVEUR API                          │
│              (Django/Python ou Node.js)                 │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Config API  │  │ RSVP / Guests│  │ Notifications │  │
│  │ (GET config)│  │ (CRUD)       │  │ (FCM Push)    │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Galerie     │  │ Cagnotte     │  │ Livre d'or    │  │
│  │ (upload/get)│  │ (Stripe)     │  │ (CRUD)        │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
┌─────────▼──┐  ┌──────▼─────┐  ┌──▼──────────┐
│ PostgreSQL │  │ Cloudinary │  │  Firebase   │
│ (données)  │  │ ou S3      │  │  (FCM Push) │
│            │  │ (médias)   │  │             │
└────────────┘  └────────────┘  └─────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    CMS / BACK-OFFICE                    │
│                      (Next.js)                          │
│                                                         │
│  Interface admin pour configurer chaque événement       │
│  Utilisé uniquement par nous, pas par le client         │
│  (sauf pack B2B wedding planners)                       │
└─────────────────────────────────────────────────────────┘
```

### Flux de données

1. **Nous** configurons un événement dans le CMS → les données sont stockées en BDD + les médias sur Cloudinary/S3
2. **L'app mobile** au lancement appelle `GET /api/events/{event_id}/config` → reçoit tout le JSON de config
3. **L'app** affiche l'interface selon la config reçue (couleurs, modules, contenu)
4. **Les invités** interagissent (RSVP, photos, livre d'or) → les données remontent via l'API
5. **Nous** envoyons des notifs push via le CMS → Firebase FCM les distribue aux appareils

---

## 3. APPLICATION MOBILE

### Stack recommandé

- **React Native** (ou Flutter si c'est ta stack actuelle — ne change pas)
- **React Navigation** pour la navigation
- **Firebase SDK** pour les notifications push + analytics
- **Axios** ou **fetch** pour les appels API
- **AsyncStorage** ou **MMKV** pour le cache local de la config

### Principe de fonctionnement

L'app ne contient AUCUN contenu en dur. Au lancement :

```
1. L'app lit le `event_id` depuis ses variables d'environnement (injecté au build)
2. L'app appelle GET /api/events/{event_id}/config
3. L'app reçoit le JSON complet de l'événement
4. L'app affiche l'interface en fonction du JSON
5. L'app met en cache le JSON pour un accès offline
```

### Écrans de l'app

Chaque écran est un composant qui s'affiche (ou non) selon la config.

| Écran | Toujours affiché | Conditionnel |
|-------|:---:|:---:|
| Splash screen | ✅ | |
| Accueil (noms, date, countdown) | ✅ | |
| Programme / Déroulé | ✅ | |
| Infos pratiques (lieu, plan d'accès, parking, dress code) | ✅ | |
| RSVP | | ✅ `modules.rsvp` |
| Galerie photo | | ✅ `modules.gallery` |
| Cagnotte | | ✅ `modules.donation` |
| Plan de table | | ✅ `modules.seating_plan` |
| Livre d'or | | ✅ `modules.guestbook` |
| Playlist collaborative | | ✅ `modules.playlist` |
| Chat invités | | ✅ `modules.chat` |
| Choix de menu | | ✅ `modules.menu_choice` |

### Gestion des couleurs

L'app applique les couleurs depuis la config de manière globale. Utiliser un ThemeProvider (ou équivalent) qui injecte les couleurs partout.

```javascript
// Exemple React Native
const theme = {
  primary: config.branding.colors.primary,       // ex: "#D4AF37"
  secondary: config.branding.colors.secondary,   // ex: "#1A1A2E"
  accent: config.branding.colors.accent,         // ex: "#F5E6CC"
  background: config.branding.colors.background, // ex: "#FFFFFF"
  text: config.branding.colors.text,             // ex: "#333333"
};
```

### Gestion offline

L'app doit fonctionner même sans connexion (mariage dans un château sans 4G). Au premier lancement, on cache tout le JSON + les images critiques (logo, programme). Les fonctionnalités interactives (RSVP, galerie upload) nécessitent une connexion mais l'app doit rester consultable offline.

### Gestion du mode "Souvenir"

Après la date de l'événement, l'app bascule automatiquement :

- Le countdown disparaît (ou affiche "C'était il y a X jours")
- Le RSVP se désactive
- Le choix de menu se désactive
- La galerie photo reste accessible (lecture seule ou upload selon config)
- Le livre d'or reste accessible en lecture
- Un message "Merci d'avoir partagé ce moment avec nous" s'affiche

Cette logique est gérée côté app en comparant `event.date` avec la date actuelle. Pas besoin d'intervention manuelle.

---

## 4. FICHIER DE CONFIGURATION CLIENT (config.json)

C'est LE fichier central. Tout ce qui différencie un client d'un autre est ici.

```json
{
  "event_id": "evt_mariage_sarah_david_2026",
  "version": "1.0",

  "event": {
    "type": "wedding",
    "title": "Sarah & David",
    "subtitle": "Nous nous marions !",
    "date": "2026-06-15T17:00:00+02:00",
    "end_date": "2026-06-16T03:00:00+02:00",
    "timezone": "Europe/Paris",
    "language": ["fr", "he"],
    "default_language": "fr",
    "guests_count_estimate": 250
  },

  "branding": {
    "app_name": "Sarah & David",
    "logo_url": "https://cdn.example.com/events/evt_xxx/logo.png",
    "icon_url": "https://cdn.example.com/events/evt_xxx/icon.png",
    "splash_url": "https://cdn.example.com/events/evt_xxx/splash.png",
    "background_image_url": "https://cdn.example.com/events/evt_xxx/bg.jpg",
    "video_intro_url": null,
    "colors": {
      "primary": "#D4AF37",
      "secondary": "#1A1A2E",
      "accent": "#F5E6CC",
      "background": "#FFFFFF",
      "text": "#333333",
      "text_light": "#FFFFFF"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Lato"
    },
    "style": "elegant"
  },

  "locations": [
    {
      "id": "loc_ceremony",
      "name": "Synagogue de la Victoire",
      "type": "ceremony",
      "address": "44 Rue de la Victoire, 75009 Paris",
      "latitude": 48.8756,
      "longitude": 2.3372,
      "time": "17:00",
      "notes": "Merci d'arriver 15 minutes en avance",
      "parking_info": "Parking Q-Park Chaussée d'Antin à 200m",
      "dress_code": "Tenue de soirée"
    },
    {
      "id": "loc_reception",
      "name": "Château de Versainville",
      "type": "reception",
      "address": "14 Rue du Château, 14700 Versainville",
      "latitude": 48.9512,
      "longitude": -0.1847,
      "time": "20:00",
      "notes": "Navettes depuis la synagogue à 19h00 et 19h30",
      "parking_info": "Parking gratuit sur place",
      "dress_code": null
    }
  ],

  "program": [
    {
      "time": "17:00",
      "title": "Cérémonie religieuse",
      "subtitle": "Synagogue de la Victoire",
      "icon": "synagogue",
      "location_id": "loc_ceremony"
    },
    {
      "time": "17:45",
      "title": "Houppa",
      "subtitle": "Dans le jardin de la synagogue",
      "icon": "houppa",
      "location_id": "loc_ceremony"
    },
    {
      "time": "19:00",
      "title": "Navettes vers la réception",
      "subtitle": "Départ devant la synagogue",
      "icon": "bus",
      "location_id": "loc_ceremony"
    },
    {
      "time": "20:00",
      "title": "Cocktail",
      "subtitle": "Terrasse du château",
      "icon": "cocktail",
      "location_id": "loc_reception"
    },
    {
      "time": "21:00",
      "title": "Dîner",
      "subtitle": "Grande salle",
      "icon": "dinner",
      "location_id": "loc_reception"
    },
    {
      "time": "23:00",
      "title": "Soirée dansante",
      "subtitle": "DJ set",
      "icon": "dance",
      "location_id": "loc_reception"
    }
  ],

  "modules": {
    "rsvp": {
      "enabled": true,
      "deadline": "2026-05-15T23:59:59+02:00",
      "allow_plus_ones": true,
      "max_plus_ones": 3,
      "ask_dietary_restrictions": true,
      "dietary_options": ["standard", "végétarien", "casher", "sans gluten", "halal"],
      "ask_allergies": true,
      "custom_questions": [
        {
          "id": "q_transport",
          "question": "Souhaitez-vous prendre la navette synagogue → château ?",
          "type": "single_choice",
          "options": ["Oui", "Non, je viens par mes propres moyens"]
        }
      ]
    },

    "gallery": {
      "enabled": true,
      "allow_upload": true,
      "allow_upload_after_event": true,
      "moderation": false,
      "max_photos_per_guest": 50,
      "preloaded_photos": []
    },

    "donation": {
      "enabled": true,
      "title": "Cagnotte",
      "description": "Participez à notre voyage de noces !",
      "provider": "stripe",
      "stripe_account_id": "acct_xxx",
      "goal_amount": null,
      "show_goal": false,
      "allow_anonymous": true,
      "min_amount": 10,
      "currency": "EUR"
    },

    "seating_plan": {
      "enabled": true,
      "image_url": "https://cdn.example.com/events/evt_xxx/seating.png",
      "interactive": false,
      "tables": [
        {
          "name": "Table des mariés",
          "guests": ["Sarah L.", "David C.", "Michel L.", "Rachel C."]
        },
        {
          "name": "Table 1 - Famille Sarah",
          "guests": ["Joseph L.", "Myriam L.", "Daniel L.", "Esther B."]
        }
      ]
    },

    "guestbook": {
      "enabled": true,
      "allow_photos": true,
      "moderation": false
    },

    "menu_choice": {
      "enabled": true,
      "deadline": "2026-06-01T23:59:59+02:00",
      "options": [
        {
          "id": "meat",
          "label": "Menu Viande",
          "description": "Filet de bœuf, pommes fondantes, légumes de saison"
        },
        {
          "id": "fish",
          "label": "Menu Poisson",
          "description": "Pavé de saumon, risotto aux asperges"
        },
        {
          "id": "veg",
          "label": "Menu Végétarien",
          "description": "Timbale de légumes, quinoa aux herbes"
        }
      ]
    },

    "playlist": {
      "enabled": false,
      "spotify_integration": false,
      "max_suggestions_per_guest": 5
    },

    "chat": {
      "enabled": false
    },

    "countdown": {
      "enabled": true,
      "target_date": "2026-06-15T17:00:00+02:00",
      "message_before": "Plus que {days} jours !",
      "message_day": "C'est aujourd'hui ! 🎉",
      "message_after": "Merci pour ce moment inoubliable"
    },

    "accommodation": {
      "enabled": true,
      "hotels": [
        {
          "name": "Hôtel & Spa du Château",
          "address": "15 Rue du Parc, 14700 Versainville",
          "phone": "+33 2 31 00 00 00",
          "website": "https://hotel-chateau.fr",
          "promo_code": "SARAHDAVID2026",
          "notes": "Tarif négocié : 120€/nuit. Mentionnez le code promo."
        }
      ]
    }
  },

  "contacts": {
    "organizer": {
      "name": "Sarah",
      "phone": "+33 6 12 34 56 78",
      "email": "sarah.david2026@gmail.com"
    },
    "emergency": {
      "name": "Rachel (témoin)",
      "phone": "+33 6 98 76 54 32"
    }
  },

  "settings": {
    "souvenir_mode_auto": true,
    "souvenir_mode_days_after": 1,
    "app_expiry_date": "2027-06-15T00:00:00+02:00",
    "show_powered_by": true,
    "powered_by_text": "Propulsé par [TA MARQUE]",
    "powered_by_url": "https://tamarque.com",
    "analytics_enabled": true
  }
}
```

### Types d'événements supportés

Le champ `event.type` détermine les icônes, les libellés par défaut, et certaines options spécifiques :

| Type | Valeur | Spécificités |
|------|--------|-------------|
| Mariage | `wedding` | Houppa, héna, RSVP +1, choix menu, cagnotte voyage de noces |
| Bar Mitzvah | `bar_mitzvah` | Prénom hébreu, synagogue, kiddoush |
| Bat Mitzvah | `bat_mitzvah` | Idem bar mitzvah |
| Brit Mila | `brit_mila` | Horaire cérémonie, séoudat |
| Baptême | `baptism` | Église, parrain/marraine |
| Communion | `communion` | Église |
| Anniversaire | `birthday` | Âge, thème |
| Fiançailles | `engagement` | Noms du couple |
| Baby Shower | `baby_shower` | Thème, liste de cadeaux |
| Autre | `other` | Tout configurable manuellement |

---

## 5. BACK-OFFICE / CMS

### Stack

- **Frontend** : Next.js (React)
- **Auth** : NextAuth.js ou Firebase Auth (pour notre login admin uniquement)
- **API** : API Routes Next.js ou Django REST Framework
- **Hébergement** : Vercel (front) + Railway/Render (API) ou tout sur un VPS

### Pages du CMS

#### 5.1 Dashboard

- Liste de tous les événements (actifs, passés, en attente de review Apple)
- Statut de chaque événement : `draft` | `pending_review` | `live` | `souvenir` | `expired`
- Stats globales : nombre d'événements actifs, CA total, RSVPs reçus

#### 5.2 Création / Édition d'événement

Un formulaire qui correspond exactement aux champs du `config.json` ci-dessus. Organisé en onglets :

**Onglet "Général"**
- Type d'événement (dropdown)
- Titre, sous-titre
- Date et heure de début/fin
- Langue(s)

**Onglet "Branding"**
- Upload logo, icône, splash screen, fond d'écran
- Color picker pour chaque couleur (primary, secondary, accent, background, text)
- Sélection de police (dropdown parmi les polices supportées)
- Upload vidéo d'intro (optionnel)

**Onglet "Lieux"**
- Ajouter/supprimer des lieux
- Pour chaque lieu : nom, type, adresse, coordonnées GPS (auto via Google Places API), horaire, notes, parking, dress code

**Onglet "Programme"**
- Liste ordonnée des étapes
- Pour chaque étape : horaire, titre, sous-titre, icône (dropdown), lieu associé
- Drag & drop pour réordonner

**Onglet "Modules"**
- Toggle on/off pour chaque module
- Pour chaque module activé : sous-formulaire avec les options spécifiques (cf. config.json)

**Onglet "Contacts"**
- Organisateur : nom, téléphone, email
- Contact d'urgence : nom, téléphone

**Onglet "Paramètres"**
- Mode souvenir automatique (on/off, délai en jours)
- Date d'expiration de l'app
- Afficher "Propulsé par" (on/off)

#### 5.3 Preview

- Un iframe qui affiche l'app en mode mobile (375x812px)
- Se met à jour en temps réel quand on modifie les champs
- Bouton "Envoyer le lien de preview au client" (génère un lien temporaire)

#### 5.4 Gestion des invités / RSVPs

- Tableau avec tous les RSVPs reçus
- Filtres : confirmé / en attente / décliné
- Export CSV / Excel
- Stats : nombre de confirmés, nombre d'accompagnants, répartition des menus, restrictions alimentaires

#### 5.5 Notifications push

- Formulaire : titre, message, date/heure d'envoi (immédiat ou programmé)
- Historique des notifications envoyées
- Stats : envoyées, ouvertes

#### 5.6 Galerie photo (modération)

- Grille de toutes les photos uploadées par les invités
- Bouton supprimer si modération activée
- Download ZIP de toutes les photos

#### 5.7 Build & Déploiement

- Bouton "Générer le build iOS + Android"
- Status du build en cours (building, submitted, in review, approved, rejected)
- Liens vers App Store Connect et Google Play Console
- QR code généré automatiquement (lien vers les stores)

---

## 6. BASE DE DONNÉES

### Schéma principal

```sql
-- Événements
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE NOT NULL,       -- ex: "mariage-sarah-david-2026"
    type            VARCHAR(50) NOT NULL,                -- "wedding", "bar_mitzvah", etc.
    title           VARCHAR(200) NOT NULL,
    subtitle        VARCHAR(300),
    event_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ,
    timezone        VARCHAR(50) DEFAULT 'Europe/Paris',
    languages       JSONB DEFAULT '["fr"]',
    default_language VARCHAR(10) DEFAULT 'fr',
    config          JSONB NOT NULL,                      -- le config.json complet
    status          VARCHAR(20) DEFAULT 'draft',         -- draft, pending_review, live, souvenir, expired
    pack            VARCHAR(20) NOT NULL,                -- essential, premium, vip
    bundle_id_ios   VARCHAR(200),
    bundle_id_android VARCHAR(200),
    store_url_ios   VARCHAR(500),
    store_url_android VARCHAR(500),
    qr_code_url     VARCHAR(500),
    client_name     VARCHAR(200),
    client_email    VARCHAR(200),
    client_phone    VARCHAR(50),
    paid_amount     DECIMAL(10,2),
    payment_status  VARCHAR(20) DEFAULT 'pending',       -- pending, partial, paid
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

-- Invités et RSVPs
CREATE TABLE guests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'pending',       -- pending, confirmed, declined
    plus_ones       INTEGER DEFAULT 0,
    plus_one_names  JSONB DEFAULT '[]',
    dietary         VARCHAR(50),                          -- standard, vegetarian, casher, etc.
    allergies       TEXT,
    menu_choice     VARCHAR(50),
    custom_answers  JSONB DEFAULT '{}',
    rsvp_date       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Galerie photos
CREATE TABLE photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    uploaded_by     VARCHAR(200),                         -- nom de l'invité
    url             VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    caption         TEXT,
    approved        BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Livre d'or
CREATE TABLE guestbook_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    author_name     VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    photo_url       VARCHAR(500),
    approved        BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Cagnotte / Dons
CREATE TABLE donations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    donor_name      VARCHAR(200),                         -- null si anonyme
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'EUR',
    message         TEXT,
    stripe_payment_id VARCHAR(200),
    status          VARCHAR(20) DEFAULT 'pending',        -- pending, completed, failed
    anonymous       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications push envoyées
CREATE TABLE push_notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'draft',          -- draft, scheduled, sent, failed
    opened_count    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions playlist
CREATE TABLE playlist_suggestions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    guest_name      VARCHAR(200) NOT NULL,
    song_title      VARCHAR(300) NOT NULL,
    artist          VARCHAR(300),
    spotify_url     VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Messages chat
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    sender_name     VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_photos_event ON photos(event_id);
CREATE INDEX idx_guestbook_event ON guestbook_entries(event_id);
CREATE INDEX idx_donations_event ON donations(event_id);
CREATE INDEX idx_notifications_event ON push_notifications(event_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
```

---

## 7. GESTION DES MÉDIAS

### Stockage

Utiliser **Cloudinary** (recommandé pour la simplicité) ou **AWS S3 + CloudFront**.

### Organisation des fichiers

```
/events
  /{event_id}
    /branding
      logo.png
      icon.png          (1024x1024 pour les stores)
      splash.png
      background.jpg
    /photos
      /gallery
        photo_001.jpg
        photo_002.jpg
        ...
      /seating
        seating_plan.png
    /video
      intro.mp4
```

### Traitement des images

- **Logo** : accepter PNG/SVG, stocker en haute résolution
- **Icône app** : doit être exactement 1024x1024 px, sans transparence, sans coins arrondis (Apple les ajoute automatiquement)
- **Splash screen** : fournir en 3 tailles (1x, 2x, 3x) ou en haute résolution et laisser le build redimensionner
- **Photos galerie** : compresser côté serveur à la réception (max 2000px de large, qualité 80%), générer une thumbnail (400px)

---

## 8. NOTIFICATIONS PUSH

### Provider

**Firebase Cloud Messaging (FCM)** — gratuit, fonctionne sur iOS et Android.

### Setup

1. Créer un projet Firebase par événement OU un seul projet Firebase avec des topics par événement
2. **Recommandé** : un seul projet Firebase, chaque événement = un topic FCM (`event_{event_id}`)
3. L'app au lancement s'abonne au topic de son événement
4. Pour envoyer une notif, le CMS envoie un message au topic via l'API Firebase Admin

### Depuis le CMS

```javascript
// Exemple Node.js avec firebase-admin
const admin = require('firebase-admin');

async function sendPushNotification(eventId, title, body) {
  const message = {
    notification: { title, body },
    topic: `event_${eventId}`,
  };
  const response = await admin.messaging().send(message);
  return response;
}
```

### Notifications programmées

Le CMS permet de programmer des notifications. Utiliser un cron job (ou un service comme BullMQ / Celery) qui vérifie toutes les minutes s'il y a des notifications à envoyer.

---

## 9. MODULES FONCTIONNELS

### 9.1 RSVP

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

### 9.2 Galerie photo

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

### 9.3 Cagnotte

**Intégration Stripe :**
- Chaque événement a un Stripe Connect account (ou on utilise notre compte Stripe avec des metadata)
- L'app appelle notre API qui crée un PaymentIntent Stripe
- Le paiement est traité par Stripe, on stocke la confirmation en BDD
- Dashboard CMS : total collecté, liste des dons, export

### 9.4 Plan de table

Deux modes :
- **Image statique** : l'organisateur upload une image du plan de table
- **Interactif** : l'invité cherche son nom → l'app lui affiche sa table (basé sur la liste `tables` dans la config)

L'interactif est mieux. L'invité tape son nom, l'app fait un search dans le JSON des tables et affiche "Vous êtes à la Table 5 — Famille Cohen".

### 9.5 Livre d'or

Simple CRUD. Les invités postent un message (+ photo optionnelle). Affiché sous forme de feed chronologique dans l'app.

### 9.6 Choix de menu

L'invité sélectionne son menu parmi les options définies dans la config. Lié à son profil RSVP. Deadline configurable. Le CMS affiche le récap (ex: 80 viande, 45 poisson, 25 végétarien).

### 9.7 Playlist collaborative

Les invités suggèrent des chansons (titre + artiste). Optionnel : intégration Spotify pour rechercher et ajouter un lien. Le DJ reçoit la liste via le CMS.

### 9.8 Chat

WebSocket (Socket.io) ou Firebase Realtime Database. Messages en temps réel entre invités. Modération optionnelle.

---

## 10. PIPELINE DE BUILD & DÉPLOIEMENT STORES

### Objectif

Un seul script qui prend un dossier client en paramètre et produit un binaire iOS (.ipa) et Android (.aab) prêt à soumettre.

### Pré-requis

- **Fastlane** installé
- **Xcode** (sur un Mac) pour le build iOS
- **Android SDK** pour le build Android
- Comptes **App Store Connect** et **Google Play Console** configurés
- Certificats de signature iOS (distribution) et keystore Android

### Structure du dossier client

```
/clients/{client_slug}/
  config.json           ← la config complète de l'événement
  assets/
    icon_1024.png       ← icône 1024x1024
    splash.png          ← splash screen haute résolution
    logo.png            ← logo de l'événement
  metadata/
    app_name.txt        ← "Sarah & David"
    description.txt     ← Description pour les stores
    keywords.txt        ← Mots-clés App Store
    screenshots/        ← Screenshots pour les stores (optionnel, peut être auto-généré)
      iphone_1.png
      iphone_2.png
      iphone_3.png
```

### Script de build (`scripts/build.sh`)

```bash
#!/bin/bash
set -e

CLIENT_SLUG=$1

if [ -z "$CLIENT_SLUG" ]; then
  echo "Usage: ./build.sh <client_slug>"
  exit 1
fi

CLIENT_DIR="./clients/$CLIENT_SLUG"
CONFIG_FILE="$CLIENT_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Config file not found: $CONFIG_FILE"
  exit 1
fi

# Lire les variables depuis config.json
APP_NAME=$(jq -r '.branding.app_name' "$CONFIG_FILE")
EVENT_ID=$(jq -r '.event_id' "$CONFIG_FILE")
BUNDLE_ID_IOS="com.tamarque.event.$(echo $CLIENT_SLUG | tr '-' '')"
BUNDLE_ID_ANDROID="com.tamarque.event.$(echo $CLIENT_SLUG | tr '-' '')"

echo "🔨 Building app for: $APP_NAME"
echo "   Bundle ID iOS: $BUNDLE_ID_IOS"
echo "   Bundle ID Android: $BUNDLE_ID_ANDROID"
echo "   Event ID: $EVENT_ID"

# 1. Copier les assets
echo "📦 Copying assets..."
cp "$CLIENT_DIR/assets/icon_1024.png" ./app/ios/AppIcon.png
cp "$CLIENT_DIR/assets/icon_1024.png" ./app/android/app/src/main/res/ic_launcher.png
cp "$CLIENT_DIR/assets/splash.png" ./app/shared/splash.png
cp "$CLIENT_DIR/assets/logo.png" ./app/shared/logo.png

# 2. Injecter les variables d'environnement
echo "⚙️  Injecting environment variables..."
cat > ./app/.env.production <<EOF
EVENT_ID=$EVENT_ID
API_BASE_URL=https://api.tamarque.com
BUNDLE_ID=$BUNDLE_ID_IOS
APP_NAME=$APP_NAME
EOF

# 3. Build iOS
echo "🍎 Building iOS..."
cd ./app/ios
fastlane build_and_upload \
  app_name:"$APP_NAME" \
  bundle_id:"$BUNDLE_ID_IOS" \
  event_id:"$EVENT_ID"
cd ../..

# 4. Build Android
echo "🤖 Building Android..."
cd ./app/android
fastlane build_and_upload \
  app_name:"$APP_NAME" \
  bundle_id:"$BUNDLE_ID_ANDROID" \
  event_id:"$EVENT_ID"
cd ../..

echo "✅ Build complete for $APP_NAME"
echo "   iOS: Submitted to App Store Connect"
echo "   Android: Submitted to Google Play Console"
```

### Fastlane — Fichier iOS (`app/ios/fastlane/Fastfile`)

```ruby
default_platform(:ios)

platform :ios do
  desc "Build and upload to App Store Connect"
  lane :build_and_upload do |options|
    # Mettre à jour le bundle ID et le nom
    update_app_identifier(
      plist_path: "Runner/Info.plist",
      app_identifier: options[:bundle_id]
    )
    update_info_plist(
      plist_path: "Runner/Info.plist",
      display_name: options[:app_name]
    )

    # Build
    build_app(
      scheme: "Runner",
      export_method: "app-store",
      output_directory: "./build",
      output_name: "#{options[:event_id]}.ipa"
    )

    # Upload
    upload_to_app_store(
      skip_metadata: false,
      skip_screenshots: true,
      force: true,
      submit_for_review: true,
      automatic_release: true
    )
  end
end
```

### Fastlane — Fichier Android (`app/android/fastlane/Fastfile`)

```ruby
default_platform(:android)

platform :android do
  desc "Build and upload to Play Store"
  lane :build_and_upload do |options|
    # Build AAB
    gradle(
      task: "bundle",
      build_type: "Release",
      properties: {
        "applicationId" => options[:bundle_id],
        "appName" => options[:app_name]
      }
    )

    # Upload
    upload_to_play_store(
      track: "production",
      aab: "./app/build/outputs/bundle/release/app-release.aab",
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end
end
```

### Automatisation CI/CD (optionnel, pour plus tard)

Utiliser **GitHub Actions** ou **Bitrise** :
1. Push d'un nouveau dossier dans `/clients/` → trigger le workflow
2. Le workflow exécute `build.sh` avec le slug du client
3. Notification Slack/email quand le build est soumis

---

## 11. STRUCTURE DU REPOSITORY GIT

```
/
├── app/                          ← Code source de l'app mobile (NE JAMAIS MODIFIER PAR CLIENT)
│   ├── src/
│   │   ├── components/           ← Composants UI réutilisables
│   │   ├── screens/              ← Écrans de l'app
│   │   ├── services/             ← API calls, notifications, storage
│   │   ├── theme/                ← ThemeProvider, gestion dynamique des couleurs
│   │   ├── config/               ← Lecture et parsing du config.json
│   │   ├── utils/                ← Helpers (dates, formatage, etc.)
│   │   └── App.tsx               ← Point d'entrée
│   ├── ios/                      ← Projet Xcode
│   ├── android/                  ← Projet Android
│   ├── assets/                   ← Assets par défaut (template)
│   └── .env.production           ← Variables d'env (écrasées au build)
│
├── api/                          ← Backend API (Django ou Node.js)
│   ├── events/                   ← CRUD événements + config
│   ├── guests/                   ← RSVPs
│   ├── photos/                   ← Galerie
│   ├── donations/                ← Cagnotte (Stripe)
│   ├── notifications/            ← Push notifications (Firebase)
│   ├── guestbook/                ← Livre d'or
│   └── ...
│
├── cms/                          ← Front-end du CMS (Next.js)
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   ├── events/
│   │   │   ├── new.tsx           ← Formulaire de création
│   │   │   ├── [id]/
│   │   │   │   ├── edit.tsx      ← Édition
│   │   │   │   ├── preview.tsx   ← Preview mobile
│   │   │   │   ├── guests.tsx    ← Liste RSVPs
│   │   │   │   ├── photos.tsx    ← Modération galerie
│   │   │   │   ├── notifications.tsx
│   │   │   │   └── build.tsx     ← Lancer le build
│   │   │   └── index.tsx
│   │   └── ...
│   └── ...
│
├── clients/                      ← Dossiers de config par client (peut être hors Git)
│   ├── mariage-sarah-david/
│   │   ├── config.json
│   │   ├── assets/
│   │   └── metadata/
│   ├── barmitzvah-nathan/
│   └── ...
│
├── scripts/
│   ├── build.sh                  ← Script de build principal
│   ├── generate_qr.sh            ← Génère le QR code d'un événement
│   └── export_guests.sh          ← Export CSV des invités
│
├── docs/
│   └── TECHNICAL_DOC.md          ← CE DOCUMENT
│
├── .gitignore
├── README.md
└── docker-compose.yml            ← Pour le dev local (API + DB + CMS)
```

### .gitignore recommandé

```
# Clients data (contient des données personnelles)
clients/*/assets/photos/
clients/*/assets/*.jpg
clients/*/assets/*.jpeg

# Builds
app/ios/build/
app/android/build/
*.ipa
*.aab
*.apk

# Env
.env
.env.local
.env.production

# Node
node_modules/

# OS
.DS_Store
Thumbs.db
```

---

## 12. VERSIONING & GESTION DES CLIENTS

### Branches Git

```
main            ← Version stable, validée par Apple. NE JAMAIS PUSH DIRECTEMENT.
develop         ← Branche de développement au quotidien
feature/*       ← Nouvelles fonctionnalités (ex: feature/chat-module)
hotfix/*        ← Corrections urgentes
```

**On ne crée PAS de branche par client.** Les clients sont gérés uniquement par leur dossier dans `/clients/` et leur config en BDD.

### Tags

```
v1.0.0-approved     ← Première version validée par Apple
v1.1.0              ← Ajout du module playlist
v1.2.0              ← Ajout du module chat
```

### Process de mise à jour globale

Quand on ajoute une fonctionnalité (ex: nouveau module) :

1. Développer sur `develop`
2. Tester avec un événement de test
3. Merger dans `main`
4. Tagger la nouvelle version
5. Les apps déjà en ligne ne sont PAS affectées (elles tournent avec leur version)
6. Les nouveaux clients bénéficient de la mise à jour
7. Si un client existant veut la mise à jour → rebuild + resoumission

---

## 13. TEMPLATE APPLE-APPROVED

### Pourquoi

Apple peut rejeter une app pour plein de raisons. En faisant valider une version "template" en amont, on s'assure que la structure, les permissions, et le flow sont conformes.

### Comment

1. Créer un événement de démo dans le CMS (faux mariage, contenu réaliste)
2. Builder l'app avec cette config
3. Soumettre sur l'App Store sous le nom de ta marque (ex: "MyEvent Demo")
4. Attendre la validation Apple
5. Une fois validée, tagger en Git : `v1.0.0-apple-approved`
6. Cette version devient ta baseline

### Points de vigilance Apple

- **Permissions** : ne demander que les permissions utilisées (caméra uniquement si galerie activée, notifications uniquement si le module est activé)
- **Privacy Policy** : obligatoire. Créer une page web avec ta privacy policy et la linker dans le store et dans l'app
- **App Review Guidelines 4.2.6** : Apple peut rejeter des "template apps" si elles semblent être des copies sans valeur ajoutée. Pour contourner ça, chaque app doit avoir un contenu unique (c'est le cas : chaque événement est différent) et ne pas être une simple "web view"
- **Metadata** : chaque app doit avoir une description unique sur le store
- **Minimum functionality** : l'app doit offrir plus qu'un simple site web. Les modules interactifs (RSVP, galerie, chat) justifient le format app native

### Description store template

```
[NOM DE L'ÉVÉNEMENT] — L'application officielle

Retrouvez toutes les informations de [l'événement] :
• Programme et déroulé de la journée
• Plan d'accès et informations pratiques
• Confirmez votre présence (RSVP)
• Partagez vos photos en direct
• Et bien plus encore !

Téléchargez l'app pour ne rien manquer.
```

---

## 14. SÉCURITÉ & DONNÉES PERSONNELLES

### RGPD

On collecte des données personnelles (noms, emails, téléphones, photos). Obligations :

- **Privacy Policy** accessible dans l'app et sur les stores
- **Consentement** : l'invité consent en soumettant le RSVP (mention légale sous le formulaire)
- **Droit de suppression** : permettre à un invité de demander la suppression de ses données
- **Durée de conservation** : supprimer les données X mois après l'expiration de l'app (12 mois après l'événement par défaut)
- **Hébergement** : données hébergées en UE (choisir un provider européen ou une région UE chez AWS/GCP)

### Sécurité technique

- **API** : toutes les routes protégées par le `event_id` — un invité ne peut accéder qu'aux données de son événement
- **HTTPS** obligatoire partout
- **Upload photos** : vérifier le type MIME, limiter la taille (max 10MB), scanner antivirus optionnel
- **Cagnotte** : aucune donnée bancaire stockée chez nous — tout passe par Stripe
- **Pas d'authentification invité** : on ne demande pas aux invités de créer un compte. L'app est ouverte via un lien/QR code. Le RSVP demande juste un nom. C'est un choix de simplicité.

### Données sensibles à ne PAS stocker dans le repo Git

- Photos des clients
- Clés API (Stripe, Firebase, etc.) → utiliser des variables d'environnement
- Données personnelles des invités

---

## 15. PROCESS CLIENT (WORKFLOW OPÉRATIONNEL)

### Vue d'ensemble

```
Client contacte → Google Form → Paiement → Config CMS (30 min) → Preview → Validation → Build → Review Apple (48h) → Livraison → Jour J → Mode souvenir → Expiration
```

### Détail pas à pas

#### Jour 0 — Premier contact
- Le client nous contacte (Instagram, site, bouche-à-oreille)
- On lui envoie :
  1. Le lien du Google Form (cahier des charges)
  2. La grille tarifaire (3 packs)
  3. Un message type (cf. ci-dessous)

**Message type premier contact :**
```
Bonjour [prénom] !

Merci pour votre intérêt pour notre application événementielle.

Pour configurer votre app, merci de remplir ce formulaire :
👉 [LIEN GOOGLE FORM]

Vous y trouverez toutes les questions nécessaires (type d'événement, branding, modules souhaités, etc.).

Pensez également à nous envoyer :
📎 Votre logo en haute qualité (PNG ou SVG)
📎 Vos photos (WeTransfer ou Google Drive)

Voici nos formules :
• Essentiel — 490€
• Premium — 790€
• VIP — 1 200€

Détails : [LIEN GRILLE TARIFAIRE]

N'hésitez pas si vous avez des questions !
```

#### Jour 1 — Réception du formulaire + paiement
- Vérifier que le formulaire est complet
- Si incomplet → relance unique avec les questions manquantes
- Encaisser le paiement (Stripe / virement)
- Ne rien commencer avant le paiement

#### Jour 1-2 — Configuration CMS
- Créer l'événement dans le CMS
- Remplir tous les champs depuis les réponses du Google Form
- Uploader les assets (logo, photos)
- Activer les modules selon le pack choisi
- Vérifier la preview

#### Jour 2 — Preview client
- Envoyer le lien de preview au client
- Attendre sa validation
- Appliquer les ajustements si nécessaires (max 2 allers-retours)

#### Jour 2-3 — Build & soumission
- Lancer `./scripts/build.sh mariage-sarah-david`
- Vérifier que le build passe
- Soumission automatique sur les stores
- Android : en ligne en quelques heures
- iOS : review en 24-48h

#### Jour 3-4 — Livraison
- Envoyer au client :
  1. Lien App Store
  2. Lien Play Store
  3. QR code (pour mettre sur les invitations papier)
  4. Mini guide pour les invités

**Message type livraison :**
```
Votre application est en ligne ! 🎉

📱 iPhone : [LIEN APP STORE]
📱 Android : [LIEN PLAY STORE]

QR Code en pièce jointe — vous pouvez l'imprimer sur vos invitations.

Pour vos invités, vous pouvez leur envoyer ce message :
"Téléchargez l'app [NOM] pour toutes les infos de [l'événement] : [LIEN]"

Besoin de nous envoyer des notifications le jour J ? Envoyez-nous les messages et horaires souhaités la veille par WhatsApp.

Mazel tov ! 🥂
```

#### Jour J — Événement
- Envoyer les notifications push programmées
- Surveiller que tout tourne (monitoring basique)

#### J+1 — Post-événement
- L'app bascule automatiquement en mode souvenir
- Rien à faire manuellement

#### J+365 — Expiration
- L'app expire
- Proposer un renouvellement (50-100€/an) si le client veut garder l'accès
- Si non renouvelé → retirer des stores + archiver les données

---

## 16. ENVIRONNEMENTS

### Développement (local)

```bash
# Lancer tout en local avec Docker
docker-compose up

# Services :
# - API : http://localhost:8000
# - CMS : http://localhost:3000
# - PostgreSQL : localhost:5432
# - App mobile : Expo / simulator
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: eventapp
      POSTGRES_USER: eventapp
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://eventapp:devpassword@db:5432/eventapp
      FIREBASE_CREDENTIALS: /app/firebase-credentials.json
      STRIPE_SECRET_KEY: sk_test_xxx
      CLOUDINARY_URL: cloudinary://xxx
    depends_on:
      - db
    volumes:
      - ./api:/app

  cms:
    build: ./cms
    ports:
      - "3000:3000"
    environment:
      API_URL: http://api:8000
    volumes:
      - ./cms:/app

volumes:
  pgdata:
```

### Staging

- Réplique de la production
- Utilisé pour tester les builds avant soumission
- URL : `https://staging-api.tamarque.com`

### Production

- API : `https://api.tamarque.com`
- CMS : `https://admin.tamarque.com`
- Hébergement recommandé : Railway, Render, ou VPS OVH/Scaleway
- BDD : PostgreSQL managé (Railway, Supabase, ou RDS)
- CDN : Cloudinary ou CloudFront pour les médias

---

## 17. CHECKLIST DE LIVRAISON

Avant de livrer une app client, vérifier CHAQUE point :

### Contenu
- [ ] Titre de l'événement correct (orthographe, accents)
- [ ] Date et heure correctes (timezone vérifiée)
- [ ] Tous les lieux renseignés avec adresses complètes
- [ ] Programme complet et dans le bon ordre chronologique
- [ ] Contacts organisateur renseignés

### Branding
- [ ] Logo affiché correctement (pas coupé, bonne résolution)
- [ ] Icône de l'app 1024x1024 sans transparence
- [ ] Couleurs appliquées partout (vérifier les écrans sombres)
- [ ] Splash screen correctement affiché sur différentes tailles d'écran
- [ ] Nom de l'app correct sur l'écran d'accueil du téléphone

### Modules
- [ ] Seuls les modules du pack choisi sont activés
- [ ] RSVP fonctionne (tester une soumission complète)
- [ ] Galerie photo : upload + affichage fonctionnels
- [ ] Cagnotte : paiement test Stripe réussi
- [ ] Plan de table : recherche par nom fonctionne
- [ ] Notifications push : test d'envoi réussi
- [ ] Countdown affiche le bon nombre de jours

### Technique
- [ ] Build iOS réussi sans erreur
- [ ] Build Android réussi sans erreur
- [ ] L'app fonctionne offline (contenu consultatble)
- [ ] Liens GPS ouvrent Google Maps / Apple Maps
- [ ] Performance : l'app charge en moins de 3 secondes
- [ ] Pas de crash au lancement (tester sur 2-3 appareils)

### Stores
- [ ] Description du store personnalisée
- [ ] Screenshots uploadés (au moins 3 pour iPhone)
- [ ] Privacy Policy linkée
- [ ] Catégorie : "Lifestyle" ou "Social Networking"
- [ ] Age rating configuré

### Livrables au client
- [ ] Lien App Store
- [ ] Lien Play Store
- [ ] QR code généré
- [ ] Message type pour les invités
- [ ] Paiement encaissé

---

## 18. FAQ TECHNIQUE

**Q : Que faire si Apple rejette l'app ?**
R : Lire le motif de rejet dans App Store Connect. Les raisons les plus courantes : metadata incomplète (description, screenshots), privacy policy manquante, ou violation de la guideline 4.2.6 (template apps). Corriger et resoumettre. Le re-review est généralement plus rapide.

**Q : Un client veut modifier quelque chose après la mise en ligne ?**
R : Modifier dans le CMS. Si c'est du contenu (textes, programme, photos) → ça se met à jour en temps réel via l'API, pas besoin de rebuild. Si c'est du branding (couleurs, logo, icône) → rebuild + resoumission stores nécessaire.

**Q : Comment gérer un client qui n'a pas de logo ?**
R : On peut lui créer un logo simple avec Canva ou un outil IA (Midjourney, DALL-E). On peut aussi utiliser les initiales du couple dans un cercle avec la police du thème. Facturer en supplément (50-100€) ou inclure dans le pack VIP.

**Q : Combien d'apps peut-on avoir sur un seul compte Apple Developer ?**
R : Pas de limite officielle. Apple n'a pas de restriction sur le nombre d'apps par compte. Cependant, si Apple détecte un pattern de "spam" (beaucoup d'apps quasi identiques), ils peuvent questionner. Nos apps sont suffisamment différentes (contenu unique) pour ne pas poser problème.

**Q : Comment gérer la cagnotte côté juridique ?**
R : On utilise Stripe Connect. L'argent va directement sur le compte Stripe du client (ou le nôtre avec transfert). On n'est pas un intermédiaire financier tant qu'on ne stocke pas les fonds. Vérifier la réglementation locale. Alternativement, on peut simplement fournir un lien vers une cagnotte externe (Leetchi, PayPal) sans gérer nous-mêmes les paiements.

**Q : Un invité peut-il utiliser l'app sans télécharger depuis le store ?**
R : Non, c'est une app native qui nécessite un téléchargement. On peut proposer en parallèle un lien web (version simplifiée) pour les invités qui ne veulent pas installer d'app, mais ce n'est pas prioritaire.

**Q : Comment gérer les mises à jour de l'app template ?**
R : Les apps déjà publiées continuent de fonctionner avec leur version. Si on ajoute un nouveau module au template, les anciens clients n'en bénéficient pas automatiquement. Il faudrait rebuild + resoumettre. C'est rarement nécessaire sauf si le client le demande (et paie pour).

**Q : Quel est le coût serveur mensuel estimé ?**
R : Pour les premiers clients, très faible. PostgreSQL managé (~10-20€/mois), API sur Railway/Render (~10-20€/mois), Cloudinary free tier pour les médias. Total : ~30-50€/mois pour gérer 10-20 événements simultanés. Ça scale facilement.

---

> **Document maintenu par l'équipe technique.**
> Toute modification de l'architecture ou du process doit être reflétée dans ce document.
> En cas de doute, le `config.json` est la source de vérité.
