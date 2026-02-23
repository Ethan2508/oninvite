/**
 * Programme Personnalisé - Design Premium Timeline
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Linking,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPersonalizedProgram } from '../services/api';

const { width } = Dimensions.get('window');

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

interface SubEvent {
  id: string;
  name: string;
  date: string;
  start_time: string;
  end_time?: string;
  location: string;
  address?: string;
  dress_code?: string;
  notes?: string;
  icon?: string;
}

interface DayGroup {
  date: string;
  formattedDate: string;
  events: SubEvent[];
}

// Demo data
const getDemoProgram = (): SubEvent[] => [
  {
    id: '1',
    name: 'Cérémonie civile',
    date: '2024-09-14',
    start_time: '11:00',
    end_time: '12:00',
    location: 'Mairie du 16ème arrondissement',
    address: '71 Avenue Henri Martin, 75016 Paris',
    dress_code: 'Tenue de ville élégante',
    notes: 'Merci d\'arriver 15 minutes avant le début',
    icon: 'business',
  },
  {
    id: '2',
    name: 'Cocktail de bienvenue',
    date: '2024-09-14',
    start_time: '13:00',
    end_time: '15:00',
    location: 'Jardin du Pavillon Royal',
    address: 'Route de Suresnes, 75016 Paris',
    dress_code: 'Tenue de cocktail',
    icon: 'wine',
  },
  {
    id: '3',
    name: 'Cérémonie religieuse',
    date: '2024-09-14',
    start_time: '16:00',
    end_time: '17:30',
    location: 'Synagogue de la Victoire',
    address: '44 Rue de la Victoire, 75009 Paris',
    dress_code: 'Tenue habillée - Kippa fournie',
    notes: 'Cérémonie de Houppa',
    icon: 'heart',
  },
  {
    id: '4',
    name: 'Dîner & Soirée dansante',
    date: '2024-09-14',
    start_time: '19:30',
    end_time: '04:00',
    location: 'Pavillon Royal',
    address: 'Route de Suresnes, 75016 Paris',
    dress_code: 'Tenue de soirée',
    notes: 'Open bar et food trucks jusqu\'à l\'aube !',
    icon: 'musical-notes',
  },
  {
    id: '5',
    name: 'Brunch du lendemain',
    date: '2024-09-15',
    start_time: '12:00',
    end_time: '15:00',
    location: 'Le Bristol Paris',
    address: '112 Rue du Faubourg Saint-Honoré, 75008 Paris',
    dress_code: 'Décontracté chic',
    notes: 'Pour prolonger la fête ensemble',
    icon: 'cafe',
  },
];

const PersonalizedProgramScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<SubEvent[]>([]);
  const [groupedProgram, setGroupedProgram] = useState<DayGroup[]>([]);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgram();
  }, []);

  useEffect(() => {
    if (!loading && program.length > 0) {
      groupByDate(program);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, program]);

  const loadProgram = async () => {
    try {
      const code = await AsyncStorage.getItem('guest_personal_code');
      const eventId = await AsyncStorage.getItem('event_id') || 'demo';
      
      if (code) {
        // Utiliser le service API centralisé
        const data = await getPersonalizedProgram(eventId, code) as any;
        
        if (data?.sub_events?.length > 0) {
          setProgram(data.sub_events);
        } else {
          setProgram(getDemoProgram());
        }
      } else {
        setProgram(getDemoProgram());
      }
    } catch (error) {
      console.log('Using demo program');
      setProgram(getDemoProgram());
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (events: SubEvent[]) => {
    const groups: Record<string, SubEvent[]> = {};
    
    events.forEach(event => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
    });

    const sortedGroups: DayGroup[] = Object.keys(groups)
      .sort()
      .map(date => ({
        date,
        formattedDate: formatDateHeader(date),
        events: groups[date].sort((a, b) => a.start_time.localeCompare(b.start_time)),
      }));

    setGroupedProgram(sortedGroups);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return "Aujourd'hui";
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Demain';
    }

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const openInMaps = (address: string) => {
    const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const getIconName = (iconName?: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      business: 'business-outline',
      wine: 'wine-outline',
      heart: 'heart-outline',
      'musical-notes': 'musical-notes-outline',
      cafe: 'cafe-outline',
      restaurant: 'restaurant-outline',
      car: 'car-outline',
      camera: 'camera-outline',
    };
    return icons[iconName || ''] || 'calendar-outline';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de votre programme...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Votre Programme</Text>
            <Text style={styles.headerSubtitle}>
              {program.length} événement{program.length > 1 ? 's' : ''} prévu{program.length > 1 ? 's' : ''}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {groupedProgram.map((group, groupIndex) => (
            <View key={group.date} style={styles.dayGroup}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <View style={styles.dateIcon}>
                  <Ionicons name="calendar" size={18} color={COLORS.white} />
                </View>
                <Text style={styles.dateText}>{group.formattedDate}</Text>
              </View>

              {/* Events Timeline */}
              <View style={styles.timeline}>
                {group.events.map((event, eventIndex) => (
                  <View key={event.id} style={styles.timelineItem}>
                    {/* Timeline connector */}
                    <View style={styles.timelineConnector}>
                      <View style={styles.timelineDot} />
                      {eventIndex < group.events.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    {/* Event Card */}
                    <View style={styles.eventCard}>
                      {/* Time Badge */}
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>{event.start_time}</Text>
                        {event.end_time && (
                          <Text style={styles.timeEnd}> - {event.end_time}</Text>
                        )}
                      </View>

                      {/* Event Header */}
                      <View style={styles.eventHeader}>
                        <View style={styles.eventIconContainer}>
                          <Ionicons 
                            name={getIconName(event.icon)} 
                            size={22} 
                            color={COLORS.primary} 
                          />
                        </View>
                        <Text style={styles.eventName}>{event.name}</Text>
                      </View>

                      {/* Location */}
                      <TouchableOpacity
                        style={styles.locationRow}
                        onPress={() => event.address && openInMaps(event.address)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="location" size={16} color={COLORS.textLight} />
                        <Text style={styles.locationText}>{event.location}</Text>
                        {event.address && (
                          <Ionicons name="open-outline" size={14} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>

                      {/* Dress Code */}
                      {event.dress_code && (
                        <View style={styles.dressCodeRow}>
                          <View style={styles.dressCodeBadge}>
                            <Ionicons name="shirt-outline" size={14} color={COLORS.secondary} />
                            <Text style={styles.dressCodeText}>{event.dress_code}</Text>
                          </View>
                        </View>
                      )}

                      {/* Notes */}
                      {event.notes && (
                        <View style={styles.notesRow}>
                          <Ionicons name="information-circle" size={16} color={COLORS.gold} />
                          <Text style={styles.notesText}>{event.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="heart" size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.footerText}>
              Nous avons hâte de partager ces moments avec vous
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  dayGroup: {
    marginTop: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineConnector: {
    width: 36,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginRight: 20,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeEnd: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  dressCodeRow: {
    marginTop: 10,
  },
  dressCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  dressCodeText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: 12,
    borderRadius: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  footerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PersonalizedProgramScreen;
