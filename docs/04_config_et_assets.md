# ÉTAPE 4 — Configuration Client & Assets

> **Statut** : À implémenter
> **Prérequis** : Étape 3 (App Mobile)
> **Livrable** : Structure config.json complète + gestion des médias

---

## 1. FICHIER DE CONFIGURATION CLIENT (config.json)

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

---

## 2. TYPES D'ÉVÉNEMENTS SUPPORTÉS

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

## 3. GESTION DES MÉDIAS

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

| Type | Format | Dimensions | Notes |
|------|--------|------------|-------|
| Logo | PNG/SVG | Haute résolution | Accepter la transparence |
| Icône app | PNG | 1024x1024 px | Sans transparence, sans coins arrondis |
| Splash screen | PNG | 3 tailles (1x, 2x, 3x) | Ou haute résolution + redimensionnement auto |
| Photos galerie | JPG | Max 2000px de large | Compresser à qualité 80%, générer thumbnail 400px |

---

## 4. STRUCTURE DU DOSSIER CLIENT

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
    screenshots/        ← Screenshots pour les stores (optionnel)
      iphone_1.png
      iphone_2.png
      iphone_3.png
```

---

## 5. VALIDATION DU CONFIG.JSON

### Champs obligatoires

```javascript
const requiredFields = [
  'event_id',
  'event.type',
  'event.title',
  'event.date',
  'branding.app_name',
  'branding.colors.primary',
  'branding.colors.secondary',
  'branding.colors.background',
  'branding.colors.text',
];

const validateConfig = (config) => {
  const errors = [];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Valider le format de date
  if (config.event?.date && isNaN(Date.parse(config.event.date))) {
    errors.push('Invalid event date format');
  }
  
  // Valider les couleurs (format hex)
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  const colors = config.branding?.colors || {};
  for (const [key, value] of Object.entries(colors)) {
    if (value && !hexColorRegex.test(value)) {
      errors.push(`Invalid color format for ${key}: ${value}`);
    }
  }
  
  return errors;
};
```

---

## 6. MODULES PAR PACK

| Module | Essentiel | Premium | VIP |
|--------|:---------:|:-------:|:---:|
| RSVP | ✅ | ✅ | ✅ |
| Infos pratiques | ✅ | ✅ | ✅ |
| Programme | ✅ | ✅ | ✅ |
| Countdown | ✅ | ✅ | ✅ |
| Notifications (5) | ✅ | | |
| Notifications (illimitées) | | ✅ | ✅ |
| Galerie photo | | ✅ | ✅ |
| Cagnotte | | ✅ | ✅ |
| Plan de table | | ✅ | ✅ |
| Livre d'or | | ✅ | ✅ |
| Choix de menu | | ✅ | ✅ |
| Mode souvenir | | ✅ | ✅ |
| Design custom | | | ✅ |
| Vidéo intro | | | ✅ |
| Playlist collaborative | | | ✅ |
| Chat invités | | | ✅ |

---

## 7. DONNÉES SENSIBLES — NE PAS STOCKER DANS GIT

- Photos des clients
- Clés API (Stripe, Firebase, etc.) → utiliser des variables d'environnement
- Données personnelles des invités

### .gitignore recommandé pour /clients

```
# Clients data (contient des données personnelles)
clients/*/assets/photos/
clients/*/assets/*.jpg
clients/*/assets/*.jpeg
```

---

## CHECKLIST DE VALIDATION

- [ ] Structure config.json complète et valide
- [ ] Tous les champs obligatoires documentés
- [ ] Assets uploadés sur Cloudinary/S3
- [ ] Icône 1024x1024 sans transparence
- [ ] Logo en haute résolution
- [ ] Couleurs hex valides
- [ ] Modules correspondant au pack choisi
- [ ] Dossier client organisé correctement

---

> **Étape suivante** : [05_cms_backoffice.md](05_cms_backoffice.md)
