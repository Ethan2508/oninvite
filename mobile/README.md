# SaveTheDate Mobile App

Application mobile React Native/Expo pour événements (mariages, bar mitzvahs, etc.)

## Architecture White-Label

L'app est **100% dynamique**. Au lancement, elle :
1. Charge la config depuis l'API (`/api/events/slug/{event_id}/config`)
2. Applique les couleurs et fonts de la config
3. Affiche les modules activés dans la config

**Un seul code source** → **Un build par client** (avec `eventId` différent)

## Structure

```
mobile/
├── App.tsx                 # Point d'entrée
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Countdown.tsx
│   │   └── Loading.tsx
│   ├── screens/            # Écrans de l'app
│   │   ├── HomeScreen.tsx      # Accueil + countdown
│   │   ├── ProgramScreen.tsx   # Programme/déroulé
│   │   ├── InfoScreen.tsx      # Infos pratiques
│   │   ├── RSVPScreen.tsx      # Formulaire RSVP
│   │   ├── GalleryScreen.tsx   # Galerie photos
│   │   ├── DonationScreen.tsx  # Cagnotte
│   │   ├── GuestbookScreen.tsx # Livre d'or
│   │   ├── PlaylistScreen.tsx  # Playlist collaborative
│   │   └── SeatingScreen.tsx   # Plan de table
│   ├── context/            # Contexts React
│   │   ├── ThemeContext.tsx    # Couleurs dynamiques
│   │   └── ConfigContext.tsx   # Config de l'événement
│   ├── navigation/         # Navigation
│   │   └── AppNavigator.tsx
│   ├── services/           # Services API
│   │   ├── api.ts
│   │   └── notifications.ts
│   ├── types/              # Types TypeScript
│   │   └── index.ts
│   └── assets/             # Assets statiques
└── scripts/
    └── build-client.sh     # Script de build white-label
```

## Installation

```bash
cd mobile
npm install
```

## Développement

```bash
# Démarrer Expo
npm start

# Ou avec tunnel (pour tester sur mobile)
npx expo start --tunnel
```

## Configuration

L'`eventId` est configuré dans `app.json` > `expo.extra.eventId`.

Pour le développement, il pointe vers `demo-mariage-test`.

## Build Production

### Avec EAS (Expo Application Services)

```bash
# iOS
npx eas-cli build --platform ios --profile production

# Android
npx eas-cli build --platform android --profile production
```

### Build White-Label automatisé

```bash
# Build pour un client spécifique
./scripts/build-client.sh marie-jean-wedding ios
./scripts/build-client.sh david-bar-mitzvah android
```

Le script :
1. Récupère la config du client depuis l'API
2. Génère un `app.json` personnalisé avec le bon nom et package
3. Lance le build EAS

## Écrans conditionnels

| Écran | Module config | Condition |
|-------|--------------|-----------|
| RSVP | `modules.rsvp` | `enabled: true` |
| Galerie | `modules.gallery` | `enabled: true` |
| Cagnotte | `modules.donation` | `enabled: true` |
| Livre d'or | `modules.guestbook` | `enabled: true` |
| Playlist | `modules.playlist` | `enabled: true` |
| Plan de table | `modules.seating_plan` | `enabled: true` |

## Thème dynamique

Les couleurs sont chargées depuis `config.branding.colors` :

```json
{
  "branding": {
    "colors": {
      "primary": "#D4AF37",
      "secondary": "#1A1A2E",
      "accent": "#F5E6CC",
      "background": "#FFFFFF",
      "text": "#333333"
    }
  }
}
```

Utilisation dans un composant :
```tsx
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const theme = useTheme();
  return <View style={{ backgroundColor: theme.colors.primary }} />;
};
```
