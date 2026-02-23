/**
 * Services API - Appels vers le backend FastAPI
 * Utilise fetch natif (compatible React Native)
 */
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Config de démo locale (fallback si API non disponible)
import demoConfig from '../config/demo-event.json';

// API URL: priorité aux variables d'environnement EAS, puis extra, puis fallback
const API_URL = 
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl || 
  'https://api.oninvite.fr';

// Mode démo activé uniquement si explicitement demandé
const isDemoMode = Constants.expoConfig?.extra?.demoMode === true;

// Cache keys
const CACHE_KEYS = {
  CONFIG: 'event_config',
  CONFIG_TIMESTAMP: 'event_config_timestamp',
  PERSONAL_CODE: 'personal_code',
  GUEST_NAME: 'guest_name',
};

// Durée du cache (1 heure)
const CACHE_DURATION = 60 * 60 * 1000;

// Helper pour les requêtes
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw { response: { data: error, status: response.status } };
  }

  return response.json();
}

/**
 * Récupère la configuration de l'événement
 * Avec mise en cache pour l'accès offline
 * En mode démo, utilise la config locale
 */
export const getEventConfig = async (eventId: string) => {
  // Mode démo : utiliser la config locale directement
  if (isDemoMode) {
    console.log('[API] Mode démo activé - utilisation config locale');
    
    // Sauvegarder en cache pour cohérence
    await AsyncStorage.setItem(CACHE_KEYS.CONFIG, JSON.stringify(demoConfig));
    await AsyncStorage.setItem(CACHE_KEYS.CONFIG_TIMESTAMP, Date.now().toString());
    
    return demoConfig;
  }

  try {
    // Vérifier le cache
    const cachedConfig = await AsyncStorage.getItem(CACHE_KEYS.CONFIG);
    const cachedTimestamp = await AsyncStorage.getItem(CACHE_KEYS.CONFIG_TIMESTAMP);
    
    if (cachedConfig && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return JSON.parse(cachedConfig);
      }
    }

    // Appel API
    const data = await fetchAPI(`/api/events/slug/${eventId}/config`);
    
    // Mettre en cache
    await AsyncStorage.setItem(CACHE_KEYS.CONFIG, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.CONFIG_TIMESTAMP, Date.now().toString());
    
    return data;
  } catch (error) {
    console.log('[API] Erreur API, tentative fallback cache/local');
    
    // En cas d'erreur, utiliser le cache même expiré
    const cachedConfig = await AsyncStorage.getItem(CACHE_KEYS.CONFIG);
    if (cachedConfig) {
      return JSON.parse(cachedConfig);
    }
    
    // Dernier recours : config démo locale
    console.log('[API] Utilisation config démo comme dernier recours');
    return demoConfig;
  }
};

/**
 * Soumettre un RSVP
 */
export const submitRSVP = async (eventId: string, data: {
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  plus_ones?: number;
  plus_one_names?: string[];
  dietary?: string;
  allergies?: string;
  menu_choice?: string;
  custom_answers?: Record<string, any>;
}) => {
  return fetchAPI(`/api/events/${eventId}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Récupérer les photos de l'événement
 */
export const getPhotos = async (eventId: string, skip = 0, limit = 50) => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    approved_only: 'true',
  });
  return fetchAPI(`/api/events/${eventId}/photos?${params}`);
};

/**
 * Upload une photo
 */
export const uploadPhoto = async (eventId: string, formData: FormData) => {
  const url = `${API_URL}/api/events/${eventId}/photos`;
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // Ne pas définir Content-Type pour FormData, le navigateur le fera
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw { response: { data: error, status: response.status } };
  }

  return response.json();
};

/**
 * Récupérer les messages du livre d'or
 */
export const getGuestbookEntries = async (eventId: string, skip = 0, limit = 50) => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    approved_only: 'true',
  });
  return fetchAPI(`/api/events/${eventId}/guestbook?${params}`);
};

/**
 * Poster un message dans le livre d'or
 */
export const postGuestbookEntry = async (eventId: string, data: {
  author_name: string;
  message: string;
  photo_url?: string;
}) => {
  return fetchAPI(`/api/events/${eventId}/guestbook`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Créer un don (PaymentIntent)
 */
export const createDonation = async (eventId: string, data: {
  amount: number;
  donor_name?: string;
  message?: string;
  anonymous?: boolean;
  currency?: string;
}) => {
  return fetchAPI(`/api/events/${eventId}/donations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Récupérer les stats des donations
 */
export const getDonationStats = async (eventId: string) => {
  return fetchAPI(`/api/events/${eventId}/donations/stats`);
};

/**
 * Suggérer une chanson pour la playlist
 */
export const suggestSong = async (eventId: string, data: {
  guest_name: string;
  song_title: string;
  artist: string;
  spotify_url?: string;
}) => {
  return fetchAPI(`/api/events/${eventId}/playlist`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Récupérer les suggestions de playlist
 */
export const getPlaylistSuggestions = async (eventId: string) => {
  return fetchAPI(`/api/events/${eventId}/playlist`);
};

/**
 * Rechercher sa table
 */
export const searchSeating = async (eventId: string, name: string) => {
  const params = new URLSearchParams({ name });
  return fetchAPI(`/api/events/${eventId}/seating?${params}`);
};

// ============================================================================
// IDENTIFICATION INVITÉ & PROGRAMME PERSONNALISÉ
// ============================================================================

/**
 * Identifier un invité par son nom, email ou téléphone
 */
export const identifyGuest = async (
  eventId: string, 
  data: { name?: string; email?: string; phone?: string }
) => {
  return fetchAPI(`/api/events/${eventId}/guests/identify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Récupérer un invité par son code personnel
 */
export const getGuestByCode = async (eventId: string, personalCode: string) => {
  return fetchAPI(`/api/events/${eventId}/guests/code/${personalCode}`);
};

/**
 * Récupérer le programme personnalisé d'un invité
 */
export const getPersonalizedProgram = async (eventId: string, personalCode: string) => {
  return fetchAPI(`/api/events/${eventId}/guests/${personalCode}/program`);
};

/**
 * Soumettre les RSVP par sous-événement
 */
export const submitSubEventRsvp = async (
  eventId: string, 
  personalCode: string, 
  data: {
    sub_event_rsvps: Array<{ sub_event_id: string; status: 'confirmed' | 'declined'; attendees_count?: number }>;
    dietary?: string;
    allergies?: string;
    message?: string;
  }
) => {
  return fetchAPI(`/api/events/${eventId}/guests/${personalCode}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ============================================================================
// STORAGE - Personal Code & Guest Info
// ============================================================================

/**
 * Sauvegarder le code personnel de l'invité
 */
export const savePersonalCode = async (code: string, guestName: string) => {
  await AsyncStorage.setItem(CACHE_KEYS.PERSONAL_CODE, code);
  await AsyncStorage.setItem(CACHE_KEYS.GUEST_NAME, guestName);
};

/**
 * Récupérer le code personnel sauvegardé
 */
export const getSavedPersonalCode = async (): Promise<{ code: string; name: string } | null> => {
  const code = await AsyncStorage.getItem(CACHE_KEYS.PERSONAL_CODE);
  const name = await AsyncStorage.getItem(CACHE_KEYS.GUEST_NAME);
  
  if (code && name) {
    return { code, name };
  }
  return null;
};

/**
 * Effacer les données d'identification (logout)
 */
export const clearGuestData = async () => {
  await AsyncStorage.removeItem(CACHE_KEYS.PERSONAL_CODE);
  await AsyncStorage.removeItem(CACHE_KEYS.GUEST_NAME);
};

/**
 * Vérifier si l'invité est déjà identifié
 */
export const isGuestIdentified = async (): Promise<boolean> => {
  const code = await AsyncStorage.getItem(CACHE_KEYS.PERSONAL_CODE);
  return !!code;
};

export default {
  getEventConfig,
  submitRSVP,
  getPhotos,
  uploadPhoto,
  getGuestbookEntries,
  postGuestbookEntry,
  createDonation,
  getDonationStats,
  suggestSong,
  getPlaylistSuggestions,
  searchSeating,
  // Identification
  identifyGuest,
  getGuestByCode,
  getPersonalizedProgram,
  submitSubEventRsvp,
  // Storage
  savePersonalCode,
  getSavedPersonalCode,
  clearGuestData,
  isGuestIdentified,
};
