/**
 * SaveTheDate Mobile App
 * Application événementielle white-label
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ConfigProvider, ThemeProvider, useConfig } from './src/context';
import { AppNavigator } from './src/navigation';
import { Loading } from './src/components';

// Composant principal avec les providers
const AppContent: React.FC = () => {
  const { config, loading, error } = useConfig();

  if (loading) {
    return <Loading message="Chargement de l'événement..." />;
  }

  if (error) {
    return (
      <Loading message={`Erreur: ${error}\nVérifiez votre connexion.`} />
    );
  }

  return (
    <ThemeProvider config={config}>
      <StatusBar style="auto" />
      <AppNavigator />
    </ThemeProvider>
  );
};

// App avec tous les providers
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConfigProvider>
          <AppContent />
        </ConfigProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
