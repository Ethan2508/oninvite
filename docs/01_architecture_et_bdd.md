# ÉTAPE 1 — Architecture & Base de données

> **Statut** : À implémenter
> **Prérequis** : Aucun
> **Livrable** : Environnement Docker fonctionnel + BDD initialisée

---

## 1. VUE D'ENSEMBLE DU PROJET

### Concept

Application mobile d'événement (mariage, bar mitzvah, brit mila, baptême, anniversaire, etc.) personnalisée pour chaque client. L'app est publiée sur l'App Store et le Play Store avec le branding du client.

### Principe fondamental

**Un seul codebase, zéro modification de code entre deux clients.** Tout ce qui change entre deux clients est externalisé dans un fichier de configuration + des assets (images).

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

## 3. BASE DE DONNÉES — SCHÉMA POSTGRESQL

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

## 4. ENVIRONNEMENT DOCKER

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

### Lancement local

```bash
# Lancer tout en local avec Docker
docker-compose up

# Services :
# - API : http://localhost:8000
# - CMS : http://localhost:3000
# - PostgreSQL : localhost:5432
# - App mobile : Expo / simulator
```

---

## 5. STRUCTURE DES DOSSIERS

```
/
├── app/                          ← Code source de l'app mobile
├── api/                          ← Backend API (Django ou Node.js)
├── cms/                          ← Front-end du CMS (Next.js)
├── clients/                      ← Dossiers de config par client
├── scripts/                      ← Scripts de build
├── docs/                         ← Documentation
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 6. ENVIRONNEMENTS

| Environnement | API | CMS | Usage |
|---------------|-----|-----|-------|
| Développement | localhost:8000 | localhost:3000 | Dev quotidien |
| Staging | staging-api.tamarque.com | staging-admin.tamarque.com | Tests avant prod |
| Production | api.tamarque.com | admin.tamarque.com | Clients réels |

### Hébergement recommandé (Production)

- **API** : Railway, Render, ou VPS OVH/Scaleway
- **BDD** : PostgreSQL managé (Railway, Supabase, ou RDS)
- **CDN** : Cloudinary ou CloudFront pour les médias

---

## CHECKLIST DE VALIDATION

- [ ] Docker installé et fonctionnel
- [ ] `docker-compose up` lance les 3 services sans erreur
- [ ] PostgreSQL accessible sur localhost:5432
- [ ] Tables créées avec le schéma ci-dessus
- [ ] Connexion BDD testée depuis l'API

---

> **Étape suivante** : [02_api_backend.md](02_api_backend.md)
