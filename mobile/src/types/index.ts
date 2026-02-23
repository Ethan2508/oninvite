/**
 * Types TypeScript pour l'application SaveTheDate
 */

// Configuration de l'événement (renvoyée par l'API)
export interface EventConfig {
  version: string;
  event_id: string;
  event: EventDetails;
  branding: Branding;
  modules: ModulesConfig;
  locations?: Location[];
  program?: ProgramItem[];
  practical_info?: PracticalInfo;
}

export interface EventDetails {
  type: 'wedding' | 'bar_mitzvah' | 'bat_mitzvah' | 'birthday' | 'corporate' | 'other';
  title: string;
  subtitle?: string;
  date: string; // ISO datetime
  end_date?: string;
  cover_image?: string;
  couple_names?: {
    person1: string;
    person2: string;
  };
}

export interface Branding {
  app_name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    text_light?: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  logo_url?: string;
}

export interface ModulesConfig {
  countdown?: { enabled: boolean };
  rsvp?: RSVPConfig;
  gallery?: GalleryConfig;
  donation?: DonationConfig;
  seating_plan?: SeatingPlanConfig;
  guestbook?: GuestbookConfig;
  playlist?: PlaylistConfig;
  chat?: { enabled: boolean };
  menu_choice?: MenuChoiceConfig;
}

export interface RSVPConfig {
  enabled: boolean;
  deadline?: string;
  max_plus_ones?: number;
  dietary_options?: string[];
  custom_questions?: CustomQuestion[];
  labels?: {
    title?: string;
    subtitle?: string;
  };
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
}

export interface GalleryConfig {
  enabled: boolean;
  allow_upload?: boolean;
  max_photos_per_guest?: number;
  moderation?: boolean;
}

export interface DonationConfig {
  enabled: boolean;
  title?: string;
  description?: string;
  goal_amount?: number;
  min_amount?: number;
  suggested_amounts?: number[];
  stripe_account_id?: string;
}

export interface SeatingPlanConfig {
  enabled: boolean;
  interactive?: boolean;
  image_url?: string;
  tables?: SeatingTable[];
}

export interface SeatingTable {
  name: string;
  guests: string[];
}

export interface GuestbookConfig {
  enabled: boolean;
  moderation?: boolean;
  allow_photos?: boolean;
}

export interface PlaylistConfig {
  enabled: boolean;
  max_suggestions_per_guest?: number;
  spotify_playlist_url?: string;
}

export interface MenuChoiceConfig {
  enabled: boolean;
  deadline?: string;
  options?: MenuOption[];
}

export interface MenuOption {
  id: string;
  label: string;
  description?: string;
  dietary_info?: string[];
}

export interface Location {
  id: string;
  name: string;
  type: 'ceremony' | 'reception' | 'party' | 'other';
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  google_maps_url?: string;
  waze_url?: string;
  notes?: string;
}

export interface ProgramItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  location_id?: string;
  icon?: string;
}

export interface PracticalInfo {
  dress_code?: {
    title: string;
    description: string;
    image_url?: string;
  };
  parking?: {
    available: boolean;
    description?: string;
    address?: string;
  };
  accommodation?: {
    hotels?: HotelInfo[];
  };
  contact?: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface HotelInfo {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  promo_code?: string;
}

// Types pour les formulaires
export interface RSVPFormData {
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  plus_ones: number;
  plus_one_names: string[];
  dietary?: string;
  allergies?: string;
  menu_choice?: string;
  custom_answers?: Record<string, any>;
}

export interface GuestbookEntryFormData {
  author_name: string;
  message: string;
  photo_url?: string;
}

export interface DonationFormData {
  amount: number;
  donor_name?: string;
  message?: string;
  anonymous: boolean;
}

export interface PlaylistSuggestionFormData {
  guest_name: string;
  song_title: string;
  artist: string;
  spotify_url?: string;
}

// Types pour les réponses API
export interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  uploaded_by?: string;
  caption?: string;
  created_at: string;
}

export interface GuestbookEntry {
  id: string;
  author_name: string;
  message: string;
  photo_url?: string;
  created_at: string;
}

export interface PlaylistSuggestion {
  id: string;
  guest_name: string;
  song_title: string;
  artist: string;
  spotify_url?: string;
  created_at: string;
}

export interface DonationStats {
  total_amount: number;
  total_count: number;
  currency: string;
}

export interface SeatingSearchResult {
  found: boolean;
  table_name?: string;
  guest_name?: string;
  message: string;
}
