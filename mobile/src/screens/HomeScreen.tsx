/**
 * Écran Accueil - Design Premium Mariage
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';

const { width, height } = Dimensions.get('window');

// Couleurs premium
const COLORS = {
  primary: '#8B7355',
  gold: '#D4AF37',
  cream: '#FAF8F5',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  secondary: '#2C3E50',
};

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const { config } = useConfig();
  const [guestName, setGuestName] = useState<string>('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const countdownScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadGuestName();
    animateIn();
  }, []);

  const loadGuestName = async () => {
    try {
      const name = await AsyncStorage.getItem('guest_first_name');
      if (name) setGuestName(name);
    } catch (e) {}
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(countdownScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Countdown calculation
  const eventDate = config?.event?.date ? new Date(config.event.date) : new Date('2024-09-14');
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const coupleNames = config?.event?.couple_names;
  const person1 = coupleNames?.person1 || 'Sarah';
  const person2 = coupleNames?.person2 || 'Ethan';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[COLORS.secondary, '#1a252f', '#0f171d']}
            style={styles.heroGradient}
          >
            {/* Decorative pattern */}
            <View style={styles.decorPattern}>
              <View style={styles.decorCircle} />
              <View style={[styles.decorCircle, styles.decorCircle2]} />
            </View>

            <Animated.View 
              style={[
                styles.heroContent,
                { opacity: fadeAnim }
              ]}
            >
              {/* Welcome Text */}
              {guestName && (
                <Text style={styles.welcomeText}>
                  Bienvenue {guestName}
                </Text>
              )}

              {/* Monogram */}
              <View style={styles.monogramContainer}>
                <Text style={styles.monogram}>
                  {person1.charAt(0)}&amp;{person2.charAt(0)}
                </Text>
              </View>

              {/* Couple Names */}
              <Text style={styles.coupleNames}>
                {person1} &amp; {person2}
              </Text>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Ionicons name="heart" size={18} color={COLORS.gold} />
                <View style={styles.dividerLine} />
              </View>

              {/* Event Type */}
              <Text style={styles.eventType}>MARIAGE</Text>

              {/* Date */}
              <Text style={styles.eventDate}>
                {formatDate(eventDate)}
              </Text>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Countdown Section */}
        <Animated.View 
          style={[
            styles.countdownSection,
            { 
              opacity: fadeAnim,
              transform: [{ scale: countdownScale }]
            }
          ]}
        >
          <View style={styles.countdownCard}>
            <Text style={styles.countdownTitle}>Le grand jour approche</Text>
            
            <View style={styles.countdownRow}>
              <View style={styles.countdownItem}>
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownNumber}>{days}</Text>
                </View>
                <Text style={styles.countdownLabel}>jours</Text>
              </View>
              
              <View style={styles.countdownItem}>
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownNumber}>{hours}</Text>
                </View>
                <Text style={styles.countdownLabel}>heures</Text>
              </View>
              
              <View style={styles.countdownItem}>
                <View style={styles.countdownCircle}>
                  <Text style={styles.countdownNumber}>{minutes}</Text>
                </View>
                <Text style={styles.countdownLabel}>min</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Welcome Message */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="mail-open-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Chers invités</Text>
            <Text style={styles.welcomeMessage}>
              Nous sommes heureux de vous compter parmi nos proches pour célébrer notre union.
              {'\n\n'}
              Retrouvez dans cette application votre programme personnalisé, les informations pratiques et confirmez votre présence.
            </Text>
            <View style={styles.signature}>
              <Text style={styles.signatureText}>Avec amour,</Text>
              <Text style={styles.signatureNames}>{person1} &amp; {person2}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.actionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.actionCard}>
            <Ionicons name="calendar-outline" size={28} color={COLORS.secondary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Programme</Text>
              <Text style={styles.actionSubtitle}>Votre planning personnalisé</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </View>

          <View style={styles.actionCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color={COLORS.secondary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>RSVP</Text>
              <Text style={styles.actionSubtitle}>Confirmez votre présence</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </View>

          <View style={styles.actionCard}>
            <Ionicons name="information-circle-outline" size={28} color={COLORS.secondary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Infos pratiques</Text>
              <Text style={styles.actionSubtitle}>Lieux, hébergement, accès</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with <Ionicons name="heart" size={12} color={COLORS.primary} /> by Oninvite
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: height * 0.55,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  decorPattern: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  decorCircle2: {
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    letterSpacing: 1,
  },
  monogramContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  monogram: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.gold,
    letterSpacing: 2,
  },
  coupleNames: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    width: 50,
    height: 1,
    backgroundColor: COLORS.gold,
    marginHorizontal: 16,
  },
  eventType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 4,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
  },
  countdownSection: {
    marginTop: -50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  countdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
    letterSpacing: 1,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  countdownItem: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.cream,
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  countdownNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  countdownLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  welcomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  welcomeMessage: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  signature: {
    marginTop: 24,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  signatureNames: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default HomeScreen;
