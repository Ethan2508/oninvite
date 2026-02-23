-- ============================================
-- SAVETHEDATE - Schema de base de données
-- ============================================

-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: events (Événements)
-- ============================================
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

-- ============================================
-- TABLE: guests (Invités et RSVPs)
-- ============================================
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

-- ============================================
-- TABLE: photos (Galerie photos)
-- ============================================
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

-- ============================================
-- TABLE: guestbook_entries (Livre d'or)
-- ============================================
CREATE TABLE guestbook_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    author_name     VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    photo_url       VARCHAR(500),
    approved        BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: donations (Cagnotte / Dons)
-- ============================================
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

-- ============================================
-- TABLE: push_notifications (Notifications push)
-- ============================================
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

-- ============================================
-- TABLE: playlist_suggestions (Suggestions playlist)
-- ============================================
CREATE TABLE playlist_suggestions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    guest_name      VARCHAR(200) NOT NULL,
    song_title      VARCHAR(300) NOT NULL,
    artist          VARCHAR(300),
    spotify_url     VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: chat_messages (Messages chat)
-- ============================================
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    sender_name     VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEX pour optimiser les requêtes
-- ============================================
CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_photos_event ON photos(event_id);
CREATE INDEX idx_guestbook_event ON guestbook_entries(event_id);
CREATE INDEX idx_donations_event ON donations(event_id);
CREATE INDEX idx_notifications_event ON push_notifications(event_id);
CREATE INDEX idx_playlist_event ON playlist_suggestions(event_id);
CREATE INDEX idx_chat_event ON chat_messages(event_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_slug ON events(slug);

-- ============================================
-- TRIGGER pour updated_at automatique
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Données de test (optionnel)
-- ============================================
INSERT INTO events (slug, type, title, subtitle, event_date, pack, config, status) VALUES (
    'demo-mariage-test',
    'wedding',
    'Marie & Jean',
    'Nous nous marions !',
    '2026-06-15 17:00:00+02',
    'premium',
    '{
        "event_id": "demo-mariage-test",
        "version": "1.0",
        "event": {
            "type": "wedding",
            "title": "Marie & Jean",
            "subtitle": "Nous nous marions !",
            "date": "2026-06-15T17:00:00+02:00"
        },
        "branding": {
            "app_name": "Marie & Jean",
            "colors": {
                "primary": "#D4AF37",
                "secondary": "#1A1A2E",
                "accent": "#F5E6CC",
                "background": "#FFFFFF",
                "text": "#333333"
            }
        },
        "modules": {
            "rsvp": {"enabled": true},
            "gallery": {"enabled": true},
            "countdown": {"enabled": true}
        }
    }'::jsonb,
    'live'
);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données initialisée avec succès !';
END $$;
