# ÉTAPE 3 — Application Mobile

> **Statut** : À implémenter
> **Prérequis** : Étape 2 (API Backend)
> **Livrable** : App React Native fonctionnelle avec tous les écrans

---

## 1. STACK RECOMMANDÉE

- **React Native** (ou Flutter si c'est ta stack actuelle)
- **React Navigation** pour la navigation
- **Firebase SDK** pour les notifications push + analytics
- **Axios** ou **fetch** pour les appels API
- **AsyncStorage** ou **MMKV** pour le cache local de la config

---

## 2. PRINCIPE DE FONCTIONNEMENT

L'app ne contient AUCUN contenu en dur. Au lancement :

```
1. L'app lit le `event_id` depuis ses variables d'environnement (injecté au build)
2. L'app appelle GET /api/events/{event_id}/config
3. L'app reçoit le JSON complet de l'événement
4. L'app affiche l'interface en fonction du JSON
5. L'app met en cache le JSON pour un accès offline
```

---

## 3. ÉCRANS DE L'APP

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

---

## 4. GESTION DES COULEURS

L'app applique les couleurs depuis la config de manière globale. Utiliser un ThemeProvider qui injecte les couleurs partout.

```javascript
// Exemple React Native — ThemeContext.js
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ config, children }) => {
  const theme = {
    primary: config.branding.colors.primary,       // ex: "#D4AF37"
    secondary: config.branding.colors.secondary,   // ex: "#1A1A2E"
    accent: config.branding.colors.accent,         // ex: "#F5E6CC"
    background: config.branding.colors.background, // ex: "#FFFFFF"
    text: config.branding.colors.text,             // ex: "#333333"
    textLight: config.branding.colors.text_light,  // ex: "#FFFFFF"
    fonts: {
      heading: config.branding.fonts.heading,      // ex: "Playfair Display"
      body: config.branding.fonts.body,            // ex: "Lato"
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### Utilisation dans un composant

```javascript
import { useTheme } from '../context/ThemeContext';

const MyButton = ({ title, onPress }) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity 
      style={{ backgroundColor: theme.primary }}
      onPress={onPress}
    >
      <Text style={{ color: theme.textLight, fontFamily: theme.fonts.body }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

---

## 5. GESTION OFFLINE

L'app doit fonctionner même sans connexion (mariage dans un château sans 4G).

### Stratégie

1. Au premier lancement, cacher tout le JSON + les images critiques (logo, programme)
2. À chaque lancement suivant, essayer de rafraîchir le cache
3. Si pas de connexion, utiliser le cache
4. Les fonctionnalités interactives (RSVP, galerie upload) nécessitent une connexion
5. L'app reste consultable offline

```javascript
// Exemple — ConfigService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CONFIG_KEY = 'event_config';
const API_URL = process.env.API_BASE_URL;
const EVENT_ID = process.env.EVENT_ID;

export const loadConfig = async () => {
  try {
    // Essayer de récupérer depuis l'API
    const response = await axios.get(`${API_URL}/api/events/${EVENT_ID}/config`);
    const config = response.data;
    
    // Mettre en cache
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    
    return config;
  } catch (error) {
    // Fallback sur le cache
    const cached = await AsyncStorage.getItem(CONFIG_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw new Error('No config available');
  }
};
```

---

## 6. GESTION DU MODE "SOUVENIR"

Après la date de l'événement, l'app bascule automatiquement :

- Le countdown disparaît (ou affiche "C'était il y a X jours")
- Le RSVP se désactive
- Le choix de menu se désactive
- La galerie photo reste accessible (lecture seule ou upload selon config)
- Le livre d'or reste accessible en lecture
- Un message "Merci d'avoir partagé ce moment avec nous" s'affiche

### Implémentation

```javascript
// Exemple — useSouvenirMode.js
import { useMemo } from 'react';

export const useSouvenirMode = (config) => {
  return useMemo(() => {
    const eventDate = new Date(config.event.date);
    const now = new Date();
    const daysAfter = config.settings.souvenir_mode_days_after || 1;
    const souvenirDate = new Date(eventDate);
    souvenirDate.setDate(souvenirDate.getDate() + daysAfter);
    
    const isSouvenirMode = config.settings.souvenir_mode_auto && now > souvenirDate;
    
    const daysSinceEvent = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
    
    return {
      isSouvenirMode,
      daysSinceEvent,
      message: config.modules.countdown.message_after || "Merci pour ce moment inoubliable"
    };
  }, [config]);
};
```

---

## 7. STRUCTURE DES DOSSIERS APP

```
/app
├── src/
│   ├── components/           ← Composants UI réutilisables
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Countdown.js
│   │   ├── PhotoGrid.js
│   │   └── ...
│   ├── screens/              ← Écrans de l'app
│   │   ├── SplashScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProgramScreen.js
│   │   ├── InfoScreen.js
│   │   ├── RSVPScreen.js
│   │   ├── GalleryScreen.js
│   │   ├── DonationScreen.js
│   │   ├── SeatingScreen.js
│   │   ├── GuestbookScreen.js
│   │   ├── PlaylistScreen.js
│   │   ├── ChatScreen.js
│   │   └── MenuChoiceScreen.js
│   ├── navigation/           ← Configuration de la navigation
│   │   └── AppNavigator.js
│   ├── services/             ← API calls, notifications, storage
│   │   ├── api.js
│   │   ├── ConfigService.js
│   │   ├── NotificationService.js
│   │   └── StorageService.js
│   ├── context/              ← Contexts React
│   │   ├── ThemeContext.js
│   │   └── ConfigContext.js
│   ├── hooks/                ← Custom hooks
│   │   ├── useConfig.js
│   │   ├── useSouvenirMode.js
│   │   └── useOffline.js
│   ├── utils/                ← Helpers
│   │   ├── dateUtils.js
│   │   ├── formatters.js
│   │   └── validators.js
│   └── App.tsx               ← Point d'entrée
├── ios/                      ← Projet Xcode
├── android/                  ← Projet Android
├── assets/                   ← Assets par défaut (template)
│   ├── fonts/
│   └── images/
└── .env.production           ← Variables d'env (écrasées au build)
```

---

## 8. NAVIGATION CONDITIONNELLE

La navigation s'adapte aux modules activés.

```javascript
// Exemple — AppNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useConfig } from '../hooks/useConfig';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const config = useConfig();
  const modules = config.modules;

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Program" component={ProgramScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
      
      {modules.rsvp?.enabled && (
        <Tab.Screen name="RSVP" component={RSVPScreen} />
      )}
      
      {modules.gallery?.enabled && (
        <Tab.Screen name="Gallery" component={GalleryScreen} />
      )}
      
      {modules.donation?.enabled && (
        <Tab.Screen name="Donation" component={DonationScreen} />
      )}
      
      {modules.guestbook?.enabled && (
        <Tab.Screen name="Guestbook" component={GuestbookScreen} />
      )}
      
      {/* ... autres modules conditionnels */}
    </Tab.Navigator>
  );
};
```

---

## 9. PERMISSIONS

Ne demander que les permissions utilisées :
- **Caméra** : uniquement si galerie activée
- **Notifications** : uniquement si le module est activé
- **Localisation** : pour ouvrir Google Maps / Apple Maps (pas besoin de permission, c'est un lien externe)

```javascript
// Exemple — demande de permission conditionnelle
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const requestNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
  } else {
    return true; // Android n'a pas besoin de permission pour les notifs
  }
};

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS demande au moment de l'usage
};
```

---

## 10. ÉCRAN D'ACCUEIL — EXEMPLE

```javascript
// HomeScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../context/ThemeContext';
import { useSouvenirMode } from '../hooks/useSouvenirMode';
import Countdown from '../components/Countdown';

const HomeScreen = () => {
  const config = useConfig();
  const theme = useTheme();
  const { isSouvenirMode, message, daysSinceEvent } = useSouvenirMode(config);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image 
        source={{ uri: config.branding.logo_url }} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={[styles.title, { color: theme.text, fontFamily: theme.fonts.heading }]}>
        {config.event.title}
      </Text>
      
      <Text style={[styles.subtitle, { color: theme.secondary }]}>
        {config.event.subtitle}
      </Text>
      
      {isSouvenirMode ? (
        <Text style={[styles.souvenirMessage, { color: theme.primary }]}>
          {message}
        </Text>
      ) : (
        config.modules.countdown?.enabled && (
          <Countdown targetDate={config.modules.countdown.target_date} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  souvenirMessage: {
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
```

---

## CHECKLIST DE VALIDATION

- [ ] App se lance et charge la config depuis l'API
- [ ] ThemeProvider applique les couleurs dynamiquement
- [ ] Tous les écrans conditionnels s'affichent selon `modules.*.enabled`
- [ ] Mode offline fonctionne (contenu consultatble sans connexion)
- [ ] Mode souvenir se déclenche après la date de l'événement
- [ ] Navigation fluide entre les écrans
- [ ] Permissions demandées uniquement quand nécessaire
- [ ] Liens GPS ouvrent Google Maps / Apple Maps
- [ ] Performance : app charge en moins de 3 secondes
- [ ] Pas de crash au lancement (tester sur iOS + Android)

---

> **Étape suivante** : [04_config_et_assets.md](04_config_et_assets.md)
