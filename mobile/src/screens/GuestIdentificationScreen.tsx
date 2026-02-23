/**
 * Écran d'identification de l'invité - Design Premium
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const STORAGE_KEY = 'guest_personal_code';

// Couleurs premium mariage
const COLORS = {
  primary: '#8B7355',
  primaryLight: '#A89078',
  secondary: '#2C3E50',
  gold: '#D4AF37',
  cream: '#FAF8F5',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  error: '#C53030',
  success: '#38A169',
  border: '#E8E4E0',
};

interface GuestIdentificationScreenProps {
  onIdentified?: (personalCode: string, guestName: string) => void;
  onIdentificationComplete?: () => void;
}

const GuestIdentificationScreen: React.FC<GuestIdentificationScreenProps> = ({ 
  onIdentified,
  onIdentificationComplete 
}) => {
  const [mode, setMode] = useState<'name' | 'code'>('name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsMoreInfo, setNeedsMoreInfo] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleIdentifyByName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez entrer votre prénom et nom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/events/demo/guests/identify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!data.found) {
        if (data.multiple_matches) {
          setNeedsMoreInfo(true);
          setError('Plusieurs personnes correspondent. Veuillez préciser avec votre email.');
        } else {
          setError(data.message || "Votre nom n'a pas été trouvé sur la liste.");
        }
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, data.personal_code);
        await AsyncStorage.setItem('guest_first_name', firstName);
        onIdentified?.(data.personal_code, `${firstName} ${lastName}`);
        onIdentificationComplete?.();
      }
    } catch (err) {
      // Mode démo - simuler succès
      const mockCode = 'DEMO01';
      await AsyncStorage.setItem(STORAGE_KEY, mockCode);
      await AsyncStorage.setItem('guest_first_name', firstName);
      onIdentified?.(mockCode, `${firstName} ${lastName}`);
      onIdentificationComplete?.();
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifyByCode = async () => {
    if (!code.trim() || code.length < 6) {
      setError('Veuillez entrer votre code à 6 caractères');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/events/demo/guests/code/${code.toUpperCase()}`
      );

      if (response.ok) {
        const guest = await response.json();
        await AsyncStorage.setItem(STORAGE_KEY, code.toUpperCase());
        await AsyncStorage.setItem('guest_first_name', guest.first_name || 'Invité');
        onIdentified?.(code.toUpperCase(), guest.name);
        onIdentificationComplete?.();
      } else {
        setError('Code invalide. Vérifiez votre invitation.');
      }
    } catch (err) {
      // Mode démo
      await AsyncStorage.setItem(STORAGE_KEY, code.toUpperCase());
      await AsyncStorage.setItem('guest_first_name', 'Invité');
      onIdentified?.(code.toUpperCase(), 'Invité');
      onIdentificationComplete?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.secondary, '#1a252f', '#0f171d']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.decorTop}>
        <View style={[styles.decorLine, { backgroundColor: COLORS.gold }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Title */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
              }
            ]}
          >
            <View style={styles.monogramContainer}>
              <Text style={styles.monogram}>S&amp;E</Text>
            </View>
            <Text style={styles.headerTitle}>Sarah &amp; Ethan</Text>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Ionicons name="heart" size={16} color={COLORS.gold} />
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.headerSubtitle}>14 Septembre 2024</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View 
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.cardTitle}>Bienvenue</Text>
            <Text style={styles.cardSubtitle}>
              Identifiez-vous pour accéder à votre programme personnalisé
            </Text>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'name' && styles.modeButtonActive,
                ]}
                onPress={() => { setMode('name'); setError(null); }}
              >
                <Ionicons 
                  name="person-outline" 
                  size={18} 
                  color={mode === 'name' ? COLORS.white : COLORS.textLight} 
                />
                <Text style={[
                  styles.modeButtonText,
                  mode === 'name' && styles.modeButtonTextActive
                ]}>
                  Mon nom
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'code' && styles.modeButtonActive,
                ]}
                onPress={() => { setMode('code'); setError(null); }}
              >
                <Ionicons 
                  name="key-outline" 
                  size={18} 
                  color={mode === 'code' ? COLORS.white : COLORS.textLight} 
                />
                <Text style={[
                  styles.modeButtonText,
                  mode === 'code' && styles.modeButtonTextActive
                ]}>
                  Mon code
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            {mode === 'name' ? (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prénom</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Votre prénom"
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="people" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Votre nom de famille"
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {needsMoreInfo && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Pour vous identifier"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleIdentifyByName}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Continuer</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.codeInstructions}>
                  Entrez le code à 6 caractères présent sur votre invitation
                </Text>
                
                <View style={styles.codeInputContainer}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View key={index} style={[
                      styles.codeBox,
                      code[index] && styles.codeBoxFilled
                    ]}>
                      <Text style={styles.codeChar}>
                        {code[index] || ''}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <TextInput
                  style={styles.hiddenInput}
                  value={code}
                  onChangeText={(text) => setCode(text.toUpperCase().slice(0, 6))}
                  autoCapitalize="characters"
                  maxLength={6}
                  autoFocus={mode === 'code'}
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleIdentifyByCode}
                  disabled={loading || code.length < 6}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={code.length === 6 ? [COLORS.primary, COLORS.primaryLight] : ['#ccc', '#bbb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Valider</Text>
                        <Ionicons name="checkmark" size={20} color={COLORS.white} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Un problème ? Contactez les mariés
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  decorTop: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  decorLine: {
    width: 60,
    height: 2,
    borderRadius: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  monogramContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  monogram: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.gold,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.gold,
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  modeButtonTextActive: {
    color: COLORS.white,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  codeInstructions: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  codeBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF',
  },
  codeChar: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default GuestIdentificationScreen;
