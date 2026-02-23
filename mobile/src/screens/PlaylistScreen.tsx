/**
 * Écran Playlist - Design Premium
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
  border: '#E8E4E0',
  spotify: '#1DB954',
};

interface Song {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  votes: number;
  voted?: boolean;
}

const PlaylistScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [songs, setSongs] = useState<Song[]>([
    { id: '1', title: 'Perfect', artist: 'Ed Sheeran', requestedBy: 'Marie L.', votes: 15, voted: false },
    { id: '2', title: 'All of Me', artist: 'John Legend', requestedBy: 'Thomas B.', votes: 12, voted: true },
    { id: '3', title: 'Thinking Out Loud', artist: 'Ed Sheeran', requestedBy: 'Sophie M.', votes: 10, voted: false },
    { id: '4', title: 'A Thousand Years', artist: 'Christina Perri', requestedBy: 'David C.', votes: 9, voted: false },
    { id: '5', title: 'Marry You', artist: 'Bruno Mars', requestedBy: 'Julie R.', votes: 8, voted: true },
    { id: '6', title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', requestedBy: 'Marc D.', votes: 7, voted: false },
  ]);

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

  const handleVote = (songId: string) => {
    setSongs(songs.map(song => {
      if (song.id === songId) {
        return {
          ...song,
          votes: song.voted ? song.votes - 1 : song.votes + 1,
          voted: !song.voted,
        };
      }
      return song;
    }));
  };

  const handleAddSong = () => {
    if (!songTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le titre de la chanson');
      return;
    }
    if (!artistName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de l\'artiste');
      return;
    }

    const newSong: Song = {
      id: Date.now().toString(),
      title: songTitle.trim(),
      artist: artistName.trim(),
      requestedBy: 'Vous',
      votes: 1,
      voted: true,
    };

    setSongs([newSong, ...songs]);
    setSongTitle('');
    setArtistName('');
    setShowAddForm(false);
    Alert.alert('Merci !', 'Votre suggestion a été ajoutée à la playlist.');
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSongs = [...filteredSongs].sort((a, b) => b.votes - a.votes);

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
                <Text style={styles.headerTitle}>Playlist</Text>
                <Text style={styles.headerSubtitle}>
                  Votez pour vos chansons préférées
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Ionicons name={showAddForm ? "close" : "add"} size={26} color={COLORS.gold} />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une chanson..."
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
          {/* Add Song Form */}
          {showAddForm && (
            <View style={styles.addCard}>
              <View style={styles.addHeader}>
                <Ionicons name="musical-notes" size={22} color={COLORS.gold} />
                <Text style={styles.addTitle}>Suggérer une chanson</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nom de la chanson"
                  placeholderTextColor="#999"
                  value={songTitle}
                  onChangeText={setSongTitle}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Artiste</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nom de l'artiste"
                  placeholderTextColor="#999"
                  value={artistName}
                  onChangeText={setArtistName}
                />
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddSong}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.gold, '#C5A030']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Ajouter à la playlist</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="musical-notes" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.statValue}>{songs.length}</Text>
              <Text style={styles.statLabel}>chansons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="heart" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.statValue}>
                {songs.reduce((acc, song) => acc + song.votes, 0)}
              </Text>
              <Text style={styles.statLabel}>votes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="people" size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.statValue}>
                {new Set(songs.map(s => s.requestedBy)).size}
              </Text>
              <Text style={styles.statLabel}>participants</Text>
            </View>
          </View>

          {/* Songs List */}
          <View style={styles.songsSection}>
            <Text style={styles.sectionTitle}>Chansons populaires</Text>
            
            {sortedSongs.map((song, index) => (
              <Animated.View
                key={song.id}
                style={[
                  styles.songCard,
                  index === 0 && styles.songCardTop,
                ]}
              >
                <View style={styles.songRank}>
                  <Text style={[
                    styles.rankText,
                    index === 0 && styles.rankTextTop
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                  <Text style={styles.songRequestedBy}>
                    Suggéré par {song.requestedBy}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    song.voted && styles.voteButtonActive
                  ]}
                  onPress={() => handleVote(song.id)}
                >
                  <Ionicons
                    name={song.voted ? "heart" : "heart-outline"}
                    size={20}
                    color={song.voted ? COLORS.white : COLORS.gold}
                  />
                  <Text style={[
                    styles.voteCount,
                    song.voted && styles.voteCountActive
                  ]}>
                    {song.votes}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Spotify Info */}
          <View style={styles.spotifyCard}>
            <View style={styles.spotifyIcon}>
              <Ionicons name="logo-spotify" size={28} color={COLORS.spotify} />
            </View>
            <View style={styles.spotifyInfo}>
              <Text style={styles.spotifyTitle}>Playlist Spotify</Text>
              <Text style={styles.spotifyDesc}>
                Retrouvez la playlist complète sur Spotify pour écouter les morceaux.
              </Text>
            </View>
            <TouchableOpacity style={styles.spotifyButton}>
              <Text style={styles.spotifyButtonText}>Ouvrir</Text>
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
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
  addCard: {
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
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addTitle: {
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
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  submitGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  songsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  songCardTop: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  songRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  rankTextTop: {
    color: COLORS.gold,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  songRequestedBy: {
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginLeft: 10,
  },
  voteButtonActive: {
    backgroundColor: COLORS.gold,
  },
  voteCount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gold,
    marginLeft: 6,
  },
  voteCountActive: {
    color: COLORS.white,
  },
  spotifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  spotifyIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  spotifyInfo: {
    flex: 1,
  },
  spotifyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  spotifyDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  spotifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.spotify,
  },
  spotifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default PlaylistScreen;
