/**
 * Écran Infos Pratiques - Design Premium
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';

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
  border: '#E8E4E0',
};

// Demo data
const getDemoLocations = () => [
  {
    id: '1',
    type: 'ceremony',
    name: 'Mairie du 16ème arrondissement',
    address: '71 Avenue Henri Martin, 75016 Paris',
    time: '11:00',
    notes: 'Parking disponible à proximité',
    icon: 'business',
  },
  {
    id: '2',
    type: 'ceremony',
    name: 'Synagogue de la Victoire',
    address: '44 Rue de la Victoire, 75009 Paris',
    time: '16:00',
    notes: 'Kippa fournie à l\'entrée',
    icon: 'heart',
  },
  {
    id: '3',
    type: 'reception',
    name: 'Pavillon Royal',
    address: 'Route de Suresnes, 75016 Paris',
    time: '19:30',
    notes: 'Voiturier disponible',
    icon: 'restaurant',
  },
];

const getDemoHotels = () => [
  {
    id: '1',
    name: 'Le Bristol Paris',
    address: '112 Rue du Faubourg Saint-Honoré',
    stars: 5,
    distance: '10 min en voiture',
    code: 'SARAHETHAN24',
    discount: '15%',
  },
  {
    id: '2',
    name: 'Hôtel Keppler',
    address: '10 Rue Kepler, 75016 Paris',
    stars: 4,
    distance: '5 min à pied',
    code: 'WEDDING2024',
    discount: '10%',
  },
];

const InfoScreen: React.FC = () => {
  const { config } = useConfig();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const locations = getDemoLocations();
  const hotels = getDemoHotels();
  const dressCode = {
    title: 'Cocktail / Tenue de soirée',
    description: 'Messieurs : costume sombre\nMesdames : robe cocktail ou longue',
    colors: ['Noir', 'Bleu marine', 'Bordeaux', 'Or'],
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openMaps = (address: string) => {
    Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(address)}`);
  };

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      business: 'business-outline',
      heart: 'heart-outline',
      restaurant: 'restaurant-outline',
      car: 'car-outline',
    };
    return icons[icon] || 'location-outline';
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
            <Text style={styles.headerTitle}>Infos Pratiques</Text>
            <Text style={styles.headerSubtitle}>
              Tout ce qu'il faut savoir
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Dress Code Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="shirt-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Dress Code</Text>
            </View>
            
            <View style={styles.dressCodeCard}>
              <Text style={styles.dressCodeTitle}>{dressCode.title}</Text>
              <Text style={styles.dressCodeDesc}>{dressCode.description}</Text>
              
              <View style={styles.colorPalette}>
                <Text style={styles.colorLabel}>Couleurs suggérées :</Text>
                <View style={styles.colors}>
                  {dressCode.colors.map((color, index) => (
                    <View key={index} style={styles.colorBadge}>
                      <Text style={styles.colorText}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Locations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="location-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Lieux</Text>
            </View>

            {locations.map((location, index) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationCard}
                onPress={() => openMaps(location.address)}
                activeOpacity={0.7}
              >
                <View style={styles.locationIcon}>
                  <Ionicons name={getIconName(location.icon)} size={24} color={COLORS.secondary} />
                </View>
                <View style={styles.locationInfo}>
                  <View style={styles.locationTime}>
                    <Ionicons name="time-outline" size={14} color={COLORS.gold} />
                    <Text style={styles.locationTimeText}>{location.time}</Text>
                  </View>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                  {location.notes && (
                    <Text style={styles.locationNotes}>{location.notes}</Text>
                  )}
                </View>
                <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Hotels Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="bed-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Hébergement</Text>
            </View>

            <Text style={styles.sectionSubtitle}>
              Nos partenaires vous offrent des réductions exclusives
            </Text>

            {hotels.map((hotel) => (
              <View key={hotel.id} style={styles.hotelCard}>
                <View style={styles.hotelHeader}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <View style={styles.stars}>
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color={COLORS.gold} />
                    ))}
                  </View>
                </View>
                <Text style={styles.hotelAddress}>{hotel.address}</Text>
                <Text style={styles.hotelDistance}>
                  <Ionicons name="car-outline" size={14} color={COLORS.textLight} /> {hotel.distance}
                </Text>
                
                <View style={styles.promoBox}>
                  <View style={styles.promoLeft}>
                    <Text style={styles.promoLabel}>Code promo</Text>
                    <Text style={styles.promoCode}>{hotel.code}</Text>
                  </View>
                  <View style={styles.promoRight}>
                    <Text style={styles.promoDiscount}>-{hotel.discount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Parking Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="car-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Parking</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.gold} />
              <Text style={styles.infoText}>
                Un service de voiturier sera disponible au Pavillon Royal.
                {'\n\n'}
                Parking public à proximité de la Synagogue : Parking Chauchat-Drouot (5 min à pied).
              </Text>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="call-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactLabel}>Une question le jour J ?</Text>
              <View style={styles.contacts}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => Linking.openURL('tel:+33612345678')}
                >
                  <Ionicons name="call" size={20} color={COLORS.white} />
                  <Text style={styles.contactButtonText}>Appeler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.contactButton, styles.contactButtonSecondary]}
                  onPress={() => Linking.openURL('sms:+33612345678')}
                >
                  <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
                  <Text style={[styles.contactButtonText, { color: COLORS.primary }]}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer spacing */}
          <View style={{ height: 40 }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
    marginLeft: 52,
  },
  dressCodeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dressCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  dressCodeDesc: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  colorPalette: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  colorLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorBadge: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  locationInfo: {
    flex: 1,
  },
  locationTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  locationTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gold,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  locationNotes: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  hotelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hotelName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  hotelAddress: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  hotelDistance: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 14,
  },
  promoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    overflow: 'hidden',
  },
  promoLeft: {
    flex: 1,
    padding: 14,
  },
  promoLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promoCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  promoRight: {
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  promoDiscount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  contactLabel: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  contacts: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default InfoScreen;
