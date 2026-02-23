/**
 * Service de notifications push (Firebase FCM via Expo)
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const PUSH_TOKEN_KEY = 'push_token';
const EVENT_SUBSCRIPTION_KEY = 'event_subscription';

/**
 * Enregistre le device pour les notifications push
 * Retourne le token Expo Push ou null si erreur
 */
export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  // Vérifier si c'est un appareil physique
  if (!Device.isDevice) {
    console.log('Les notifications push nécessitent un appareil physique');
    return null;
  }

  // Vérifier/demander les permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log("Permission refusée pour les notifications");
    return null;
  }

  // Configuration spécifique Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
    });
  }

  // Récupérer le token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    token = pushToken.data;
    
    // Sauvegarder le token localement
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    
    console.log('Push token:', token);
  } catch (error) {
    console.error("Erreur lors de l'obtention du push token:", error);
  }

  return token;
}

/**
 * Récupère le token push enregistré
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Enregistre un listener pour les notifications reçues
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Enregistre un listener pour les interactions avec les notifications
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Programme une notification locale
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger,
  });
}

/**
 * Annule toutes les notifications programmées
 */
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Récupère le nombre de badges
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Met à jour le badge
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Enregistre le device auprès du serveur pour recevoir les notifications
 * d'un événement spécifique (topic FCM)
 */
export async function subscribeToEvent(eventId: string): Promise<boolean> {
  try {
    const token = await getStoredPushToken();
    if (!token) {
      console.log("Pas de token push, impossible de s'abonner");
      return false;
    }

    // Envoyer le token au serveur pour s'abonner au topic
    await api.post(`/notifications/subscribe/${eventId}`, {
      token: token,
      platform: Platform.OS,
    });

    // Sauvegarder l'abonnement localement
    await AsyncStorage.setItem(EVENT_SUBSCRIPTION_KEY, eventId);
    
    console.log(`Abonné aux notifications de l'événement ${eventId}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'abonnement:", error);
    return false;
  }
}

/**
 * Désabonne le device des notifications d'un événement
 */
export async function unsubscribeFromEvent(eventId: string): Promise<boolean> {
  try {
    const token = await getStoredPushToken();
    if (!token) return false;

    await api.post(`/notifications/unsubscribe/${eventId}`, {
      token: token,
    });

    await AsyncStorage.removeItem(EVENT_SUBSCRIPTION_KEY);
    
    console.log(`Désabonné des notifications de l'événement ${eventId}`);
    return true;
  } catch (error) {
    console.error("Erreur lors du désabonnement:", error);
    return false;
  }
}

/**
 * Récupère l'ID de l'événement auquel le device est abonné
 */
export async function getSubscribedEventId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(EVENT_SUBSCRIPTION_KEY);
  } catch {
    return null;
  }
}

/**
 * Initialise les notifications pour un événement
 * (enregistrement + abonnement en une seule étape)
 */
export async function initializeNotifications(eventId: string): Promise<boolean> {
  const token = await registerForPushNotifications();
  if (!token) {
    return false;
  }
  
  return await subscribeToEvent(eventId);
}

export default {
  registerForPushNotifications,
  getStoredPushToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  scheduleLocalNotification,
  cancelAllScheduledNotifications,
  getBadgeCount,
  setBadgeCount,
  subscribeToEvent,
  unsubscribeFromEvent,
  getSubscribedEventId,
  initializeNotifications,
};
