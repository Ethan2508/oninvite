/**
 * Écran Livre d'Or - Design Premium
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
  KeyboardAvoidingView,
  Platform,
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
  border: '#E8E4E0',
};

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  date: string;
  avatar?: string;
}

const GuestbookScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const entries: GuestbookEntry[] = [
    {
      id: '1',
      name: 'David & Rachel Cohen',
      message: 'Félicitations aux mariés ! Nous vous souhaitons tout le bonheur du monde. Que votre amour grandisse chaque jour davantage. Mazal Tov !',
      date: '2024-09-15',
    },
    {
      id: '2',
      name: 'Marc Levy',
      message: 'Quelle belle cérémonie ! Les mariés étaient rayonnants. On vous souhaite une vie remplie de bonheur et d\'amour.',
      date: '2024-09-14',
    },
    {
      id: '3',
      name: 'Famille Benhamou',
      message: 'Un mariage magnifique, à l\'image de votre couple. Tous nos vœux de bonheur pour cette nouvelle vie à deux.',
      date: '2024-09-14',
    },
    {
      id: '4',
      name: 'Sophie & Thomas',
      message: 'Merci pour cette soirée inoubliable ! L\'amour que vous partagez est une inspiration pour nous tous.',
      date: '2024-09-13',
    },
  ];

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

  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire un message');
      return;
    }
    
    Alert.alert(
      'Merci !',
      'Votre message a été ajouté au livre d\'or.',
      [{ text: 'OK', onPress: () => {
        setMessage('');
        setName('');
        setIsWriting(false);
      }}]
    );
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
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Livre d'Or</Text>
                <Text style={styles.headerSubtitle}>
                  {entries.length} messages de vos proches
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.writeButton}
                onPress={() => setIsWriting(!isWriting)}
              >
                <Ionicons name={isWriting ? "close" : "create"} size={22} color={COLORS.gold} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Write Form */}
            {isWriting && (
              <View style={styles.writeCard}>
                <View style={styles.writeHeader}>
                  <Ionicons name="pencil" size={20} color={COLORS.gold} />
                  <Text style={styles.writeTitle}>Écrire un message</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Votre nom</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Prénom et nom"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Votre message</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Partagez vos vœux aux mariés..."
                    placeholderTextColor="#999"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                  />
                </View>
                
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
                    <Text style={styles.submitText}>Publier</Text>
                    <Ionicons name="send" size={18} color={COLORS.white} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Quote Card */}
            <View style={styles.quoteCard}>
              <Ionicons name="heart" size={28} color={COLORS.gold} />
              <Text style={styles.quoteText}>
                "L'amour ne consiste pas à se regarder l'un l'autre,{'\n'}
                mais à regarder ensemble dans la même direction."
              </Text>
              <Text style={styles.quoteAuthor}>— Antoine de Saint-Exupéry</Text>
            </View>

            {/* Messages */}
            <View style={styles.messagesSection}>
              <Text style={styles.sectionTitle}>Messages</Text>
              
              {entries.map((entry, index) => (
                <Animated.View
                  key={entry.id}
                  style={[
                    styles.messageCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 30 + index * 10],
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(entry.name)}</Text>
                    </View>
                    <View style={styles.messageInfo}>
                      <Text style={styles.messageName}>{entry.name}</Text>
                      <Text style={styles.messageDate}>{formatDate(entry.date)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.messageText}>{entry.message}</Text>
                  
                  <View style={styles.messageDecor}>
                    <Ionicons name="heart-outline" size={16} color={COLORS.gold} />
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  writeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  writeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  writeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  writeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
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
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    marginBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
    marginTop: 16,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  messagesSection: {
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  messageInfo: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  messageDate: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  messageDecor: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default GuestbookScreen;
