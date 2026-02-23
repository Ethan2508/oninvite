/**
 * Hook pour gérer les notifications push
 */
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '../services/notifications';

interface UseNotificationsResult {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export const useNotifications = (): UseNotificationsResult => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Enregistrer pour les notifications
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      })
      .catch((err) => {
        setError(err.message);
      });

    // Listener pour les notifications reçues (app ouverte)
    notificationListener.current = addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    // Listener pour les interactions avec les notifications
    responseListener.current = addNotificationResponseListener((response) => {
      // Gérer la navigation basée sur la notification
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      // TODO: Naviguer vers l'écran approprié selon data.screen
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
  };
};

export default useNotifications;
