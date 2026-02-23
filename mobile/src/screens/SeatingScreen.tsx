/**
 * Écran Plan de Table - Design Premium
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

interface Table {
  id: string;
  name: string;
  guests: string[];
  position: { x: number; y: number };
  shape: 'round' | 'rectangular';
}

const SeatingScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Données de démonstration
  const guestName = "David Cohen";
  const guestTable = "Table 5 - Les Orchidées";
  
  const tables: Table[] = [
    { id: '1', name: 'Table 1 - Les Roses', guests: ['Marie L.', 'Thomas B.', 'Sophie M.', 'Lucas P.', 'Emma R.', 'Hugo D.', 'Léa F.', 'Nathan G.'], position: { x: 0.2, y: 0.2 }, shape: 'round' },
    { id: '2', name: 'Table 2 - Les Lys', guests: ['Julie K.', 'Marc A.', 'Claire S.', 'Antoine M.', 'Laura V.', 'Maxime B.'], position: { x: 0.5, y: 0.2 }, shape: 'round' },
    { id: '3', name: 'Table 3 - Les Tulipes', guests: ['Sarah T.', 'David C.', 'Camille L.', 'Julien M.', 'Océane P.', 'Théo B.', 'Manon D.', 'Louis C.'], position: { x: 0.8, y: 0.2 }, shape: 'round' },
    { id: '4', name: 'Table 4 - Les Pivoines', guests: ['Chloé F.', 'Raphaël S.', 'Inès G.', 'Adam K.', 'Zoé M.', 'Noah L.'], position: { x: 0.2, y: 0.5 }, shape: 'round' },
    { id: '5', name: 'Table 5 - Les Orchidées', guests: ['David Cohen', 'Rachel Cohen', 'Benjamin L.', 'Sarah B.', 'Jonathan M.', 'Rebecca S.', 'Samuel K.', 'Esther D.'], position: { x: 0.5, y: 0.5 }, shape: 'round' },
    { id: '6', name: 'Table 6 - Les Magnolias', guests: ['Paul H.', 'Anaïs T.', 'Romain V.', 'Charlotte P.', 'Quentin B.', 'Pauline S.'], position: { x: 0.8, y: 0.5 }, shape: 'round' },
    { id: 'mariés', name: 'Table d\'Honneur', guests: ['Les Mariés', 'Parents Mariée', 'Parents Marié', 'Témoins'], position: { x: 0.5, y: 0.85 }, shape: 'rectangular' },
  ];

  const myTable = tables.find(t => t.guests.includes('David Cohen'));

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

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.guests.some(guest => guest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTablePress = (table: Table) => {
    setSelectedTable(selectedTable?.id === table.id ? null : table);
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
            <Text style={styles.headerTitle}>Plan de Table</Text>
            <Text style={styles.headerSubtitle}>
              Trouvez votre place
            </Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un nom ou une table..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* My Table Card */}
          {myTable && (
            <View style={styles.myTableCard}>
              <View style={styles.myTableIcon}>
                <Ionicons name="location" size={28} color={COLORS.gold} />
              </View>
              <View style={styles.myTableInfo}>
                <Text style={styles.myTableLabel}>Votre place</Text>
                <Text style={styles.myTableName}>{myTable.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.myTableButton}
                onPress={() => handleTablePress(myTable)}
              >
                <Text style={styles.myTableButtonText}>Voir</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* View Mode Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map" size={18} color={viewMode === 'map' ? COLORS.white : COLORS.textLight} />
              <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
                Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? COLORS.white : COLORS.textLight} />
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                Liste
              </Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'map' ? (
            /* Map View */
            <View style={styles.mapContainer}>
              <View style={styles.mapArea}>
                {/* Dance Floor */}
                <View style={styles.danceFloor}>
                  <Text style={styles.danceFloorText}>Piste de danse</Text>
                </View>
                
                {/* Tables */}
                {tables.map((table) => (
                  <TouchableOpacity
                    key={table.id}
                    style={[
                      styles.tableMarker,
                      table.shape === 'rectangular' && styles.tableMarkerRect,
                      table.id === myTable?.id && styles.tableMarkerMine,
                      selectedTable?.id === table.id && styles.tableMarkerSelected,
                      {
                        left: `${table.position.x * 80 + 5}%`,
                        top: `${table.position.y * 80 + 5}%`,
                      }
                    ]}
                    onPress={() => handleTablePress(table)}
                  >
                    <Text style={[
                      styles.tableMarkerText,
                      (table.id === myTable?.id || selectedTable?.id === table.id) && styles.tableMarkerTextHighlight
                    ]}>
                      {table.id === 'mariés' ? '♥' : table.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.mapLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
                  <Text style={styles.legendText}>Votre table</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>Autres tables</Text>
                </View>
              </View>
            </View>
          ) : (
            /* List View */
            <View style={styles.listContainer}>
              {filteredTables.map((table) => (
                <TouchableOpacity
                  key={table.id}
                  style={[
                    styles.tableCard,
                    table.id === myTable?.id && styles.tableCardMine,
                  ]}
                  onPress={() => handleTablePress(table)}
                >
                  <View style={styles.tableCardHeader}>
                    <View style={[
                      styles.tableNumber,
                      table.id === myTable?.id && styles.tableNumberMine
                    ]}>
                      <Text style={[
                        styles.tableNumberText,
                        table.id === myTable?.id && styles.tableNumberTextMine
                      ]}>
                        {table.id === 'mariés' ? '♥' : table.id}
                      </Text>
                    </View>
                    <View style={styles.tableInfo}>
                      <Text style={styles.tableName}>{table.name}</Text>
                      <Text style={styles.tableGuestCount}>
                        {table.guests.length} invités
                      </Text>
                    </View>
                    <Ionicons
                      name={selectedTable?.id === table.id ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.textLight}
                    />
                  </View>
                  
                  {selectedTable?.id === table.id && (
                    <View style={styles.tableGuests}>
                      {table.guests.map((guest, index) => (
                        <View key={index} style={styles.guestRow}>
                          <Ionicons name="person" size={16} color={COLORS.primaryLight} />
                          <Text style={[
                            styles.guestName,
                            guest === 'David Cohen' && styles.guestNameMine
                          ]}>
                            {guest}
                            {guest === 'David Cohen' && ' (vous)'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Table Detail */}
          {selectedTable && viewMode === 'map' && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{selectedTable.name}</Text>
              <Text style={styles.detailSubtitle}>
                {selectedTable.guests.length} personnes à cette table
              </Text>
              <View style={styles.detailGuests}>
                {selectedTable.guests.map((guest, index) => (
                  <View key={index} style={styles.detailGuestTag}>
                    <Text style={[
                      styles.detailGuestName,
                      guest === 'David Cohen' && styles.detailGuestNameMine
                    ]}>
                      {guest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    paddingBottom: 20,
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  myTableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  myTableIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  myTableInfo: {
    flex: 1,
  },
  myTableLabel: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
    marginBottom: 2,
  },
  myTableName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  myTableButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myTableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  mapContainer: {
    marginBottom: 20,
  },
  mapArea: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
    padding: 10,
  },
  danceFloor: {
    position: 'absolute',
    left: '30%',
    top: '60%',
    width: '40%',
    height: '15%',
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  danceFloorText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tableMarker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -22 }, { translateY: -22 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tableMarkerRect: {
    width: 80,
    borderRadius: 12,
    transform: [{ translateX: -40 }, { translateY: -22 }],
  },
  tableMarkerMine: {
    backgroundColor: COLORS.gold,
    width: 50,
    height: 50,
    borderRadius: 25,
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  tableMarkerSelected: {
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  tableMarkerText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  tableMarkerTextHighlight: {
    fontSize: 18,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  listContainer: {
    gap: 12,
  },
  tableCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tableCardMine: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  tableCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tableNumberMine: {
    backgroundColor: COLORS.gold,
  },
  tableNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  tableNumberTextMine: {
    color: COLORS.white,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  tableGuestCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  tableGuests: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestName: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
  },
  guestNameMine: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  detailGuests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailGuestTag: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailGuestName: {
    fontSize: 14,
    color: COLORS.text,
  },
  detailGuestNameMine: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});

export default SeatingScreen;
