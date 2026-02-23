/**
 * RSVP par Sous-événement - Design Premium
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getPersonalizedProgram, submitSubEventRsvp } from '../services/api';

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
  error: '#E53E3E',
  border: '#E8E4E0',
};

interface SubEventRSVP {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'declined';
  attendees: number;
  maxGuests: number;
}

// Demo data avec format ISO pour cohérence avec l'API
const getDemoRSVPs = (): SubEventRSVP[] => [
  {
    id: '1',
    name: 'Cérémonie civile',
    date: '2026-09-14',
    time: '11:00',
    location: 'Mairie du 16ème',
    status: 'pending',
    attendees: 1,
    maxGuests: 2,
  },
  {
    id: '2',
    name: 'Cérémonie religieuse',
    date: '2026-09-14',
    time: '16:00',
    location: 'Synagogue de la Victoire',
    status: 'pending',
    attendees: 1,
    maxGuests: 2,
  },
  {
    id: '3',
    name: 'Dîner & Soirée',
    date: '2026-09-14',
    time: '19:30',
    location: 'Pavillon Royal',
    status: 'pending',
    attendees: 1,
    maxGuests: 2,
  },
  {
    id: '4',
    name: 'Brunch du lendemain',
    date: '2026-09-15',
    time: '12:00',
    location: 'Le Bristol Paris',
    status: 'pending',
    attendees: 1,
    maxGuests: 2,
  },
];

// Formater une date ISO en format français lisible
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const SubEventRSVPScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rsvps, setRsvps] = useState<SubEventRSVP[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [message, setMessage] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRSVPs();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadRSVPs = async () => {
    try {
      const code = await AsyncStorage.getItem('guest_personal_code');
      const eventId = await AsyncStorage.getItem('event_id') || 'demo';
      
      if (code) {
        // Utiliser le service API centralisé
        const program = await getPersonalizedProgram(eventId, code) as any;
        
        if (program?.sub_events?.length > 0) {
          // Transformer les sous-événements en format SubEventRSVP
          const formattedRsvps: SubEventRSVP[] = program.sub_events.map((se: any) => ({
            id: se.slug,
            name: se.name,
            date: se.date || '',
            time: se.start_time || '',
            location: se.location_name || '',
            status: se.rsvp_status || 'pending',
            attendees: se.attendees_count || 1,
            maxGuests: 2,
          }));
          setRsvps(formattedRsvps);
        } else {
          setRsvps(getDemoRSVPs());
        }
      } else {
        setRsvps(getDemoRSVPs());
      }
    } catch (error) {
      console.log('Falling back to demo data:', error);
      setRsvps(getDemoRSVPs());
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, status: 'confirmed' | 'declined') => {
    setRsvps(prev => prev.map(r => 
      r.id === id ? { ...r, status } : r
    ));
  };

  const updateAttendees = (id: string, delta: number) => {
    seconst eventId = await AsyncStorage.getItem('event_id') || 'demo';
      
      if (code) {
        await submitSubEventRsvp(eventId, code, {
          sub_event_rsvps: rsvps.map(r => ({
            sub_event_id: r.id,
            status: r.status === 'pending' ? 'confirmed' : r.status,
            attendees_count: r.attendees,
          })),
          dietary: dietaryRestrictions || undefined,
          allergies: allergies || undefined,
          message: message || undefined,
        });
      }
    } catch (error) {
      // Demo mode - continue anyway
      console.log('RSVP submit error (demo mode):', error);OST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rsvps: rsvps.map(r => ({
            sub_event_id: r.id,
            status: r.status === 'pending' ? 'confirmed' : r.status,
            attendee_count: r.attendees,
          })),
          dietary_restrictions: dietaryRestrictions,
          allergies,
          message,
        }),
      });
    } catch (error) {
      // Demo mode
    }

    // Show success
    setSubmitted(true);
    Animated.spring(successScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    setSubmitting(false);
  };

  const confirmedCount = rsvps.filter(r => r.status === 'confirmed').length;
  const pendingCount = rsvps.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <LinearGradient
          colors={[COLORS.secondary, '#1a252f']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.successContent, { transform: [{ scale: successScale }] }]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.gold} />
          </View>
          <Text style={styles.successTitle}>Merci !</Text>
          <Text style={styles.successText}>
            Vos réponses ont bien été enregistrées.{'\n'}
            Nous avons hâte de vous voir !
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.successButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </Animated.View>
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
            <Text style={styles.headerTitle}>Confirmer votre présence</Text>
            <Text style={styles.headerSubtitle}>
              Répondez pour chaque événement
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
          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{rsvps.length}</Text>
                <Text style={styles.summaryLabel}>événements</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.success }]}>{confirmedCount}</Text>
                <Text style={styles.summaryLabel}>confirmés</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.gold }]}>{pendingCount}</Text>
                <Text style={styles.summaryLabel}>en attente</Text>
              </View>
            </View>
          </View>

          {/* RSVP Cards */}
          {rsvps.map((event) => (
            <View key={event.id} style={[
              styles.rsvpCard,
              event.status === 'declined' && styles.rsvpCardDeclined
            ]}>
              {/* Event Info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.eventMeta}>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.metaText}>{formatDate(event.date)}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.metaText}>{event.time}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
                  <Text style={styles.metaText}>{event.location}</Text>
                </View>
              </View>

              {/* Status Buttons */}
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    event.status === 'confirmed' && styles.statusButtonConfirmed
                  ]}
                  onPress={() => updateStatus(event.id, 'confirmed')}
                >
                  <Ionicons 
                    name={event.status === 'confirmed' ? 'checkmark-circle' : 'checkmark-circle-outline'} 
                    size={22} 
                    color={event.status === 'confirmed' ? COLORS.white : COLORS.success} 
                  />
                  <Text style={[
                    styles.statusButtonText,
                    event.status === 'confirmed' && styles.statusButtonTextActive
                  ]}>
                    Présent
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    event.status === 'declined' && styles.statusButtonDeclined
                  ]}
                  onPress={() => updateStatus(event.id, 'declined')}
                >
                  <Ionicons 
                    name={event.status === 'declined' ? 'close-circle' : 'close-circle-outline'} 
                    size={22} 
                    color={event.status === 'declined' ? COLORS.white : COLORS.error} 
                  />
                  <Text style={[
                    styles.statusButtonText,
                    { color: event.status === 'declined' ? COLORS.white : COLORS.error }
                  ]}>
                    Absent
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Attendee Counter */}
              {event.status === 'confirmed' && (
                <View style={styles.attendeeSection}>
                  <Text style={styles.attendeeLabel}>Nombre de personnes</Text>
                  <View style={styles.attendeeCounter}>
                    <TouchableOpacity
                      style={[styles.counterBtn, event.attendees <= 1 && styles.counterBtnDisabled]}
                      onPress={() => updateAttendees(event.id, -1)}
                      disabled={event.attendees <= 1}
                    >
                      <Ionicons name="remove" size={20} color={event.attendees <= 1 ? '#ccc' : COLORS.secondary} />
                    </TouchableOpacity>
                    <View style={styles.counterValue}>
                      <Text style={styles.counterNumber}>{event.attendees}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.counterBtn, event.attendees >= event.maxGuests && styles.counterBtnDisabled]}
                      onPress={() => updateAttendees(event.id, 1)}
                      disabled={event.attendees >= event.maxGuests}
                    >
                      <Ionicons name="add" size={20} color={event.attendees >= event.maxGuests ? '#ccc' : COLORS.secondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.attendeeHint}>Maximum {event.maxGuests} pers.</Text>
                </View>
              )}
            </View>
          ))}

          {/* Additional Info */}
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Informations complémentaires</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Ionicons name="restaurant-outline" size={18} color={COLORS.primary} />
                <Text style={styles.inputLabelText}>Régime alimentaire</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Végétarien, végan, halal, casher..."
                placeholderTextColor="#999"
                value={dietaryRestrictions}
                onChangeText={setDietaryRestrictions}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Ionicons name="warning-outline" size={18} color={COLORS.primary} />
                <Text style={styles.inputLabelText}>Allergies</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Gluten, arachides, fruits de mer..."
                placeholderTextColor="#999"
                value={allergies}
                onChangeText={setAllergies}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
                <Text style={styles.inputLabelText}>Message pour les mariés</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Un petit mot..."
                placeholderTextColor="#999"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                <Text style={styles.submitText}>Confirmer mes réponses</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 26,
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
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  rsvpCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  rsvpCardDeclined: {
    opacity: 0.6,
  },
  eventInfo: {
    marginBottom: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
  },
  statusButtonConfirmed: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  statusButtonDeclined: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.success,
  },
  statusButtonTextActive: {
    color: COLORS.white,
  },
  attendeeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  attendeeLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  attendeeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterBtnDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    minWidth: 50,
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  attendeeHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 10,
  },
  additionalSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: COLORS.cream,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SubEventRSVPScreen;
