/**
 * ConfigContext - Gestion de la configuration de l'événement
 * Charge la config depuis l'API et la met en cache
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Constants from 'expo-constants';
import { EventConfig } from '../types';
import { getEventConfig } from '../services/api';

interface ConfigContextType {
  config: EventConfig | null;
  loading: boolean;
  error: string | null;
  eventId: string;
  reload: () => Promise<void>;
  isModuleEnabled: (moduleName: string) => boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

// Event ID: priorité aux variables d'environnement EAS, puis extra
const getEventId = (): string => {
  return (
    process.env.EXPO_PUBLIC_EVENT_ID ||
    Constants.expoConfig?.extra?.eventId ||
    'demo-mariage-test'
  );
};

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Event ID depuis l'env ou la config Expo (injecté au build)
  const eventId = getEventId();

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEventConfig(eventId);
      setConfig(data);
    } catch (err: any) {
      console.error('Failed to load config:', err);
      setError(err.message || 'Impossible de charger la configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [eventId]);

  // Vérifie si un module est activé
  const isModuleEnabled = (moduleName: string): boolean => {
    if (!config?.modules) return false;
    const module = config.modules[moduleName as keyof typeof config.modules];
    return module?.enabled ?? false;
  };

  const reload = async () => {
    await loadConfig();
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        error,
        eventId,
        reload,
        isModuleEnabled,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export default ConfigContext;
