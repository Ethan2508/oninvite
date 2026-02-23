/**
 * Écran Programme Générique - Design Premium
 * (Pour événements non-mariage)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Couleurs premium
const COLORS = {
  primary: '#8B7355',
  primaryLight: '#A89078',
  gold: '#D4AF37',
  cream: '#FAF8F5',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  secondary: '#2C3E50',
  success: '#38A169',
  border: '#E8E4E0',
};

interface ProgramEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
  icon: string;
  duration?: string;
}

const ProgramScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const days = [
    { date: 'Vendredi 13', label: 'Veille' },
    { date: 'Samedi 14', label: 'Jour J' },
    { date: 'Dimanche 15', label: 'Brunch' },
  ];

  const programByDay: ProgramEvent[][] = [
    // Vendredi
    [
      { id: '1', time: '18:00', title: 'Accueil des invités', description: 'Installation des premiers arrivants', location: 'Hôtel Mercure', icon: 'home', duration: '2h' },
      { id: '2', time: '20:00', title: 'Dîner de répétition', description: 'Dîner décontracté avec les proches', location: 'Restaurant Le Jardin', icon: 'restaurant', duration: '3h' },
    ],
    // Samedi
    [
      { id: '3', time: '14:00', title: 'Cérémonie religieuse', description: 'Cérémonie traditionnelle', location: 'Synagogue de Paris', icon: 'star', duration: '1h30' },
      { id: '4', time: '16:00', title: 'Cocktail', description: 'Cocktail et photos dans les jardins', location: 'Domaine de Malassise', icon: 'wine', duration: '2h' },
      { id: '5', time: '18:30', title: 'Cérémonie laïque', description: 'Cérémonie d\'engagement', location: 'Jardins du Domaine', icon: 'heart', duration: '45min' },
      { id: '6', time: '19:30', title: 'Dîner de réception', description: 'Dîner assis et animations', location: 'Salle de réception', icon: 'restaurant', duration: '3h' },
      { id: '7', time: '23:00', title: 'Soirée dansante', description: 'Musique et festivités', location: 'Salle de réception', icon: 'musical-notes', duration: 'Toute la nuit' },
    ],
    // Dimanche
    [
      { id: '8', time: '11:00', title: 'Brunch', description: 'Brunch convivial pour clôturer le weekend', location: 'Terrasse du Domaine', icon: 'cafe', duration: '3h' },
      { id: '9', time: '14:00', title: 'Départs', description: 'Fin des festivités', location: 'Domaine de Malassise', icon: 'car', duration: '' },
    ],
  ];

  const currentProgram = programByDay[selectedDay];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLocationPress = (location: string) => {
    const query = encodeURIComponent(location);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'home': 'home',
      'restaurant': 'restaurant',
      'star': 'star',
      'wine': 'wine',
      'heart': 'heart',
      'musical-notes': 'musical-notes',
      'cafe': 'cafe',
      'car': 'car',
    };
    return iconMap[iconName] || 'calendar';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.secondary, '#1a252f']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Programme</Text>
            <Text style={styles.headerSubtitle}>
              Le déroulé de votre événement
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.dayButtonActive
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[
                styles.dayDate,
                selectedDay === index && styles.dayDateActive
              ]}>
                {day.date}
              </Text>
              <Text style={[
                styles.dayLabel,
                selectedDay === index && styles.dayLabelActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Timeline */}
          <View style={styles.timeline}>
            {currentProgram.map((event, index) => (
              <View key={event.id} style={styles.timelineItem}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{event.time}</Text>
                  {event.duration && (
                    <Text style={styles.durationText}>{event.duration}</Text>
                  )}
                </View>

                {/* Timeline Line */}
                <View style={styles.timelineLineContainer}>
                  <View style={[
                    styles.timelineDot,
                    index === 0 && styles.timelineDotFirst
                  ]} />
                  {index < currentProgram.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                {/* Event Card */}
                <View style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventIconBox}>
                      <Ionicons
                        name={getIconName(event.icon)}
                        size={20}
                        color={COLORS.gold}
                      />
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                  </View>
                  
                  {event.description && (
                    <Text style={styles.eventDescription}>
                      {event.description}
                    </Text>
                  )}
                  
                  {event.location && (
                    <TouchableOpacity
                      style={styles.locationRow}
                      onPress={() => handleLocationPress(event.location!)}
                    >
                      <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.locationText}>{event.location}</Text>
                      <Ionicons name="open-outline" size={14} color={COLORS.primaryLight} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Bon à savoir</Text>
              <Text style={styles.infoText}>
                Les horaires sont donnés à titre indicatif et peuvent légèrement varier le jour J.
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
              <Text style={styles.actionText}>Ajouter au calendrier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={22} color={COLORS.primary} />
              <Text style={styles.actionText}>Partager</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  daySelector: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.cream,
    marginRight: 8,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: COLORS.primary,
  },
  dayDate: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  dayDateActive: {
    color: COLORS.white,
  },
  dayLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  dayLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  timelineLineContainer: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gold,
    zIndex: 1,
  },
  timelineDotFirst: {
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    bottom: -20,
    width: 2,
    backgroundColor: COLORS.border,
  },
  eventCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 6,
    marginRight: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});

export default ProgramScreen;
