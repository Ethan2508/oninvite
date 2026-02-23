/**
 * Écran Galerie Photos - Design Premium
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 3;
const IMAGE_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

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

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string;
  uploaded_by?: string;
  created_at: string;
}

// Demo photos
const getDemoPhotos = (): Photo[] => [
  { id: '1', url: 'https://picsum.photos/800/1200?random=1', thumbnail_url: 'https://picsum.photos/400/400?random=1', uploaded_by: 'Sarah', created_at: '2024-09-14T15:30:00' },
  { id: '2', url: 'https://picsum.photos/800/800?random=2', thumbnail_url: 'https://picsum.photos/400/400?random=2', uploaded_by: 'David', created_at: '2024-09-14T16:00:00' },
  { id: '3', url: 'https://picsum.photos/1200/800?random=3', thumbnail_url: 'https://picsum.photos/400/400?random=3', uploaded_by: 'Rachel', created_at: '2024-09-14T16:30:00' },
  { id: '4', url: 'https://picsum.photos/800/1000?random=4', thumbnail_url: 'https://picsum.photos/400/400?random=4', uploaded_by: 'Marc', created_at: '2024-09-14T17:00:00' },
  { id: '5', url: 'https://picsum.photos/900/900?random=5', thumbnail_url: 'https://picsum.photos/400/400?random=5', uploaded_by: 'Julie', created_at: '2024-09-14T17:30:00' },
  { id: '6', url: 'https://picsum.photos/800/1100?random=6', thumbnail_url: 'https://picsum.photos/400/400?random=6', uploaded_by: 'Thomas', created_at: '2024-09-14T18:00:00' },
  { id: '7', url: 'https://picsum.photos/1000/800?random=7', thumbnail_url: 'https://picsum.photos/400/400?random=7', uploaded_by: 'Emma', created_at: '2024-09-14T18:30:00' },
  { id: '8', url: 'https://picsum.photos/800/900?random=8', thumbnail_url: 'https://picsum.photos/400/400?random=8', uploaded_by: 'Lucas', created_at: '2024-09-14T19:00:00' },
  { id: '9', url: 'https://picsum.photos/900/1000?random=9', thumbnail_url: 'https://picsum.photos/400/400?random=9', uploaded_by: 'Léa', created_at: '2024-09-14T19:30:00' },
];

const GalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPhotos();
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

  const loadPhotos = async () => {
    // Simulate API call
    setTimeout(() => {
      setPhotos(getDemoPhotos());
      setLoading(false);
    }, 500);
  };

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          url: result.assets[0].uri,
          thumbnail_url: result.assets[0].uri,
          uploaded_by: 'Vous',
          created_at: new Date().toISOString(),
        };
        setPhotos([newPhoto, ...photos]);
        setUploading(false);
      }, 1500);
    }
  };

  const renderPhoto = ({ item, index }: { item: Photo; index: number }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => setSelectedPhoto(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnail_url }}
        style={styles.photo}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des photos...</Text>
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
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Galerie</Text>
                <Text style={styles.headerSubtitle}>
                  {photos.length} photo{photos.length > 1 ? 's' : ''} partagée{photos.length > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color={COLORS.white} />
                    <Text style={styles.uploadButtonText}>Ajouter</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Photo Grid */}
      <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="images-outline" size={48} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Aucune photo</Text>
              <Text style={styles.emptyText}>
                Soyez le premier à partager un souvenir !
              </Text>
            </View>
          }
        />
      </Animated.View>

      {/* Photo Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedPhoto(null)}
          >
            <View style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          
          {selectedPhoto && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.photoInfo}>
                <View style={styles.photoInfoRow}>
                  <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.photoInfoText}>
                    {selectedPhoto.uploaded_by || 'Anonyme'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    paddingVertical: GAP,
  },
  photoContainer: {
    margin: GAP / 2,
  },
  photo: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.7,
  },
  photoInfo: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  photoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  photoInfoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default GalleryScreen;
