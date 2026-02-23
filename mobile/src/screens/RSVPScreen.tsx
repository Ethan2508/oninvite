/**
 * Écran RSVP Générique - Design Premium
 * (Pour événements non-mariage, backup)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  Alert,
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
  error: '#E53E3E',
  border: '#E8E4E0',
};

type RSVPStatus = 'pending' | 'attending' | 'not_attending';

const RSVPScreen: React.FC = () => {
  const [status, setStatus] = useState<RSVPStatus>('pending');
  const [guestCount, setGuestCount] = useState(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const eventTitle = "Réception de Mariage";
  const eventDate = "Dimanche 15 Septembre 2024";
  const eventTime = "à 19h00";
  const eventLocation = "Domaine de Malassise";
  const deadline = "1er Septembre 2024";

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    if (status === 'pending') {
      Alert.alert('Erreur', 'Veuillez indiquer si vous serez présent');
      return;
    }

    setSubmitted(true);
    Animated.spring(successScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <LinearGradient
          colors={[COLORS.secondary, '#1a252f']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.successContent, { transform: [{ scale: successScale }] }]}>
          <View style={[
            styles.successIcon,
            status === 'not_attending' && styles.successIconDeclined
          ]}>
            <Ionicons
              name={status === 'attending' ? "checkmark-circle" : "close-circle"}
              size={60}
              color={status === 'attending' ? COLORS.success : COLORS.error}
            />
          </View>
          <Text style={styles.successTitle}>
            {status === 'attending' ? 'Merci !' : 'Dommage...'}
          </Text>
          <Text style={styles.successText}>
            {status === 'attending'
              ? `Votre présence est confirmée${guestCount > 1 ? ` avec ${guestCount - 1} accompagnant${guestCount > 2 ? 's' : ''}` : ''}.`
              : 'Nous espérons vous voir prochainement.'}
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => setSubmitted(false)}
          >
            <Text style={styles.successButtonText}>Modifier ma réponse</Text>
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
            <Text style={styles.headerTitle}>Confirmation</Text>
            <Text style={styles.headerSubtitle}>
              Merci de confirmer votre présence
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
          {/* Event Card */}
          <View style={styles.eventCard}>
            <View style={styles.eventIcon}>
              <Ionicons name="calendar" size={28} color={COLORS.gold} />
            </View>
            <Text style={styles.eventTitle}>{eventTitle}</Text>
            <Text style={styles.eventDateTime}>
              {eventDate} {eventTime}
            </Text>
            <Text style={styles.eventLocation}>{eventLocation}</Text>
            
            <View style={styles.deadlineRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.gold} />
              <Text style={styles.deadlineText}>
                Répondre avant le {deadline}
              </Text>
            </View>
          </View>

          {/* Status Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre réponse</Text>
            
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'attending' && styles.statusButtonActive,
              ]}
              onPress={() => setStatus('attending')}
            >
              <View style={[
                styles.statusIconBox,
                status === 'attending' && styles.statusIconBoxActive,
              ]}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={status === 'attending' ? COLORS.white : COLORS.success}
                />
              </View>
              <View style={styles.statusTextBox}>
                <Text style={[
                  styles.statusTitle,
                  status === 'attending' && styles.statusTitleActive,
                ]}>
                  Je serai présent(e)
                </Text>
                <Text style={[
                  styles.statusDesc,
                  status === 'attending' && styles.statusDescActive,
                ]}>
                  Confirmer ma participation
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'not_attending' && styles.statusButtonDeclined,
              ]}
              onPress={() => setStatus('not_attending')}
            >
              <View style={[
                styles.statusIconBox,
                status === 'not_attending' && styles.statusIconBoxDeclined,
              ]}>
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={status === 'not_attending' ? COLORS.white : COLORS.error}
                />
              </View>
              <View style={styles.statusTextBox}>
                <Text style={[
                  styles.statusTitle,
                  status === 'not_attending' && styles.statusTitleActive,
                ]}>
                  Je ne pourrai pas venir
                </Text>
                <Text style={[
                  styles.statusDesc,
                  status === 'not_attending' && styles.statusDescActive,
                ]}>
                  Décliner l'invitation
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Guest Count (only if attending) */}
          {status === 'attending' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombre de personnes</Text>
              
              <View style={styles.counterCard}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    guestCount <= 1 && styles.counterButtonDisabled
                  ]}
                  onPress={() => guestCount > 1 && setGuestCount(guestCount - 1)}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={guestCount <= 1 ? '#ccc' : COLORS.primary}
                  />
                </TouchableOpacity>
                
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{guestCount}</Text>
                  <Text style={styles.counterLabel}>
                    {guestCount === 1 ? 'personne' : 'personnes'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setGuestCount(guestCount + 1)}
                >
                  <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Additional Info (only if attending) */}
          {status === 'attending' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations complémentaires</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Restrictions alimentaires</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Végétarien, allergies, etc."
                  placeholderTextColor="#999"
                  value={dietaryRestrictions}
                  onChangeText={setDietaryRestrictions}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message (optionnel)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Un petit mot pour les organisateurs..."
                  placeholderTextColor="#999"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            status === 'pending' && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={status === 'pending'}
        >
          <LinearGradient
            colors={status === 'pending' 
              ? ['#ccc', '#bbb'] 
              : status === 'attending' 
                ? [COLORS.success, '#2D8A5E']
                : [COLORS.error, '#C53030']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>
              {status === 'pending' 
                ? 'Choisir une réponse'
                : status === 'attending'
                  ? 'Confirmer ma présence'
                  : 'Confirmer mon absence'}
            </Text>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(56, 161, 105, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconDeclined: {
    backgroundColor: 'rgba(229, 62, 62, 0.2)',
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
    padding: 20,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    marginBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  eventIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  eventDateTime: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: 16,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deadlineText: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
    marginLeft: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  statusButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  statusButtonDeclined: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    marginRight: 14,
  },
  statusIconBoxActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusIconBoxDeclined: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusTextBox: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  statusTitleActive: {
    color: COLORS.white,
  },
  statusDesc: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  counterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterDisplay: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  counterValue: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.text,
  },
  counterLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
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
    minHeight: 80,
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default RSVPScreen;
