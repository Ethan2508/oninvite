/**
 * Écran Cagnotte - Design Premium
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
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

interface DonationConfig {
  title?: string;
  subtitle?: string;
  goalAmount?: number | null;  // null = pas d'objectif affiché
  showProgress?: boolean;      // false = pas de barre de progression
  suggestedAmounts?: number[];
}

const DonationScreen: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  // Configuration - vient de l'API en production
  const donationConfig: DonationConfig = {
    title: "Cagnotte",
    subtitle: "Participez à notre voyage de noces",
    goalAmount: null,         // null = pas d'objectif affiché
    showProgress: false,      // Masquer la progression
    suggestedAmounts: [50, 100, 150, 200],
  };

  const suggestedAmounts = donationConfig.suggestedAmounts || [50, 100, 150, 200];
  const goalAmount = donationConfig.goalAmount;
  const showProgress = donationConfig.showProgress && goalAmount;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 1) {
      Alert.alert('Erreur', 'Veuillez sélectionner un montant');
      return;
    }
    if (!isAnonymous && !donorName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom ou cocher anonyme');
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
          <View style={styles.successIcon}>
            <Ionicons name="heart" size={60} color={COLORS.gold} />
          </View>
          <Text style={styles.successTitle}>Merci !</Text>
          <Text style={styles.successText}>
            Votre contribution de {selectedAmount || customAmount}€{'\n'}
            a bien été enregistrée.
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => setSubmitted(false)}
          >
            <Text style={styles.successButtonText}>Retour</Text>
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
            <Text style={styles.headerTitle}>Cagnotte</Text>
            <Text style={styles.headerSubtitle}>
              Participez à notre voyage de noces
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
          {/* Intro Card - toujours affiché */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="gift" size={40} color={COLORS.gold} />
            </View>
            <Text style={styles.introText}>
              Votre participation nous aidera à réaliser notre voyage de noces.
              Merci infiniment pour votre générosité !
            </Text>
          </View>

          {/* Amount Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir un montant</Text>
            
            <View style={styles.amountsGrid}>
              {suggestedAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedAmount === amount && styles.amountButtonActive
                  ]}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  <Text style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.amountButtonTextActive
                  ]}>
                    {amount}€
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customAmountContainer}>
              <Text style={styles.customLabel}>Ou montant libre</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={(text) => {
                    setCustomAmount(text);
                    setSelectedAmount(null);
                  }}
                />
                <Text style={styles.euroSign}>€</Text>
              </View>
            </View>
          </View>

          {/* Donor Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vos informations</Text>
            
            <TouchableOpacity
              style={styles.anonymousRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                {isAnonymous && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.anonymousText}>Contribution anonyme</Text>
            </TouchableOpacity>

            {!isAnonymous && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Votre nom</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Prénom et nom"
                  placeholderTextColor="#999"
                  value={donorName}
                  onChangeText={setDonorName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message (optionnel)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Un petit mot pour les mariés..."
                placeholderTextColor="#999"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.gold, '#C5A030']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Ionicons name="heart" size={22} color={COLORS.white} />
            <Text style={styles.submitText}>
              Contribuer {selectedAmount || customAmount ? `${selectedAmount || customAmount}€` : ''}
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
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  introIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
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
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  amountButton: {
    width: (width - 40 - 36) / 4,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  amountButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  amountButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  amountButtonTextActive: {
    color: COLORS.white,
  },
  customAmountContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  euroSign: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  anonymousText: {
    fontSize: 15,
    color: COLORS.text,
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

export default DonationScreen;
