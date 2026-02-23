/**
 * Navigation principale - Bottom Tabs + Screens conditionnels
 * Avec flow d'identification invité pour les mariages
 */
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useConfig, useTheme } from '../context';
import {
  HomeScreen,
  ProgramScreen,
  InfoScreen,
  RSVPScreen,
  GalleryScreen,
  DonationScreen,
  GuestbookScreen,
  PlaylistScreen,
  SeatingScreen,
  GuestIdentificationScreen,
  PersonalizedProgramScreen,
  SubEventRSVPScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Icônes simples (en prod, utiliser un icon pack)
const TabIcon = ({ icon, focused, color }: { icon: string; focused: boolean; color: string }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>{icon}</Text>
  </View>
);

// Stack pour les écrans "Plus"
const MoreStack = () => {
  const theme = useTheme();
  const { isModuleEnabled } = useConfig();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen} 
        options={{ title: 'Plus' }}
      />
      {isModuleEnabled('donation') && (
        <Stack.Screen 
          name="Donation" 
          component={DonationScreen}
          options={{ title: 'Cagnotte' }}
        />
      )}
      {isModuleEnabled('guestbook') && (
        <Stack.Screen 
          name="Guestbook" 
          component={GuestbookScreen}
          options={{ title: "Livre d'or" }}
        />
      )}
      {isModuleEnabled('playlist') && (
        <Stack.Screen 
          name="Playlist" 
          component={PlaylistScreen}
          options={{ title: 'Playlist' }}
        />
      )}
      {isModuleEnabled('seating_plan') && (
        <Stack.Screen 
          name="Seating" 
          component={SeatingScreen}
          options={{ title: 'Plan de table' }}
        />
      )}
    </Stack.Navigator>
  );
};

// Menu "Plus" avec liste des fonctionnalités
const MoreMenuScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const { isModuleEnabled } = useConfig();

  const menuItems = [
    { key: 'donation', label: '💝 Cagnotte', screen: 'Donation', enabled: isModuleEnabled('donation') },
    { key: 'guestbook', label: "📝 Livre d'or", screen: 'Guestbook', enabled: isModuleEnabled('guestbook') },
    { key: 'playlist', label: '🎵 Playlist', screen: 'Playlist', enabled: isModuleEnabled('playlist') },
    { key: 'seating', label: '📋 Plan de table', screen: 'Seating', enabled: isModuleEnabled('seating_plan') },
  ].filter(item => item.enabled);

  return (
    <View style={[styles.moreMenu, { backgroundColor: theme.colors.background }]}>
      {menuItems.map((item) => (
        <View
          key={item.key}
          style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
        >
          <Text
            style={[styles.menuItemText, { color: theme.colors.text }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            {item.label}
          </Text>
        </View>
      ))}
      {menuItems.length === 0 && (
        <View style={styles.emptyMenu}>
          <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>
            Aucune fonctionnalité supplémentaire
          </Text>
        </View>
      )}
    </View>
  );
};

const AppNavigator: React.FC = () => {
  const theme = useTheme();
  const { isModuleEnabled, config } = useConfig();
  const [isIdentified, setIsIdentified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if guest is already identified
  useEffect(() => {
    checkIdentification();
  }, []);

  const checkIdentification = async () => {
    try {
      const code = await AsyncStorage.getItem('guest_personal_code');
      setIsIdentified(!!code);
    } catch (error) {
      console.error('Error checking identification:', error);
      setIsIdentified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentificationComplete = () => {
    setIsIdentified(true);
  };

  // Vérifier si on a des fonctionnalités "Plus"
  const hasMoreFeatures =
    isModuleEnabled('donation') ||
    isModuleEnabled('guestbook') ||
    isModuleEnabled('playlist') ||
    isModuleEnabled('seating_plan');

  // Use wedding-focused screens if groups feature is enabled
  const useWeddingMode = isModuleEnabled('invitation_groups') || config?.event_type === 'wedding';

  // Show loading while checking identification
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Chargement...</Text>
      </View>
    );
  }

  // Show identification screen if not identified and wedding mode is enabled
  if (useWeddingMode && !isIdentified) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Identification">
            {(props) => (
              <GuestIdentificationScreen
                {...props}
                onIdentificationComplete={handleIdentificationComplete}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.placeholder,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {/* Accueil - toujours affiché */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Accueil',
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="🏠" focused={focused} color={color} />
            ),
          }}
        />

        {/* Programme - personnalisé en mode mariage */}
        <Tab.Screen
          name="Program"
          component={useWeddingMode ? PersonalizedProgramScreen : ProgramScreen}
          options={{
            title: 'Programme',
            headerShown: useWeddingMode ? false : true,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="📅" focused={focused} color={color} />
            ),
          }}
        />

        {/* RSVP - par sous-événement en mode mariage */}
        {isModuleEnabled('rsvp') && (
          <Tab.Screen
            name="RSVP"
            component={useWeddingMode ? SubEventRSVPScreen : RSVPScreen}
            options={{
              title: 'RSVP',
              headerShown: useWeddingMode ? false : true,
              tabBarIcon: ({ focused, color }) => (
                <TabIcon icon="✉️" focused={focused} color={color} />
              ),
            }}
          />
        )}

        {/* Galerie - conditionnel */}
        {isModuleEnabled('gallery') && (
          <Tab.Screen
            name="Gallery"
            component={GalleryScreen}
            options={{
              title: 'Photos',
              tabBarIcon: ({ focused, color }) => (
                <TabIcon icon="📷" focused={focused} color={color} />
              ),
            }}
          />
        )}

        {/* Infos - toujours affiché */}
        <Tab.Screen
          name="Info"
          component={InfoScreen}
          options={{
            title: 'Infos',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="ℹ️" focused={focused} color={color} />
            ),
          }}
        />

        {/* Plus - si des fonctionnalités supplémentaires */}
        {hasMoreFeatures && (
          <Tab.Screen
            name="More"
            component={MoreStack}
            options={{
              title: 'Plus',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <TabIcon icon="⋯" focused={focused} color={color} />
              ),
            }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMenu: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 18,
  },
  emptyMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default AppNavigator;
