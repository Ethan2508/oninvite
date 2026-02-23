/**
 * Service API pour le CMS
 * Toutes les requêtes vers le backend FastAPI
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oninvite.fr';
const API_KEY = process.env.API_KEY || '';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Helper pour les requêtes API
 */
async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (requiresAuth && API_KEY) {
    (headers as Record<string, string>)['X-API-Key'] = API_KEY;
  }

  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// ÉVÉNEMENTS
// ============================================================================

export interface Event {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle?: string;
  event_date: string;
  end_date?: string;
  status: 'draft' | 'pending_review' | 'live' | 'souvenir' | 'expired';
  pack: 'essential' | 'premium' | 'vip';
  config: any;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface EventStats {
  confirmed: number;
  pending: number;
  declined: number;
  total: number;
}

/**
 * Liste tous les événements
 */
export async function getEvents(status?: string): Promise<Event[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI(`/api/events/${query}`);
}

/**
 * Récupère un événement par ID
 */
export async function getEvent(eventId: string): Promise<Event> {
  return fetchAPI(`/api/events/${eventId}`);
}

/**
 * Crée un nouvel événement
 */
export async function createEvent(data: Partial<Event>): Promise<Event> {
  return fetchAPI('/api/events/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Met à jour un événement
 */
export async function updateEvent(eventId: string, data: Partial<Event>): Promise<Event> {
  return fetchAPI(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Supprime un événement
 */
export async function deleteEvent(eventId: string): Promise<void> {
  return fetchAPI(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
}

/**
 * Change le statut d'un événement
 */
export async function updateEventStatus(eventId: string, status: string): Promise<Event> {
  return fetchAPI(`/api/events/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Récupère le lifecycle d'un événement
 */
export async function getEventLifecycle(eventId: string): Promise<any> {
  return fetchAPI(`/api/events/${eventId}/lifecycle`);
}

// ============================================================================
// SOUS-ÉVÉNEMENTS
// ============================================================================

export interface SubEvent {
  id: string;
  event_id: string;
  slug: string;
  name: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  dress_code?: string;
  notes?: string;
  sort_order: number;
}

/**
 * Liste les sous-événements
 */
export async function getSubEvents(eventId: string): Promise<SubEvent[]> {
  return fetchAPI(`/api/events/${eventId}/sub-events`);
}

/**
 * Récupère les templates de sous-événements
 */
export async function getSubEventTemplates(): Promise<any[]> {
  return fetchAPI('/api/events/templates', { requiresAuth: false });
}

/**
 * Crée un sous-événement
 */
export async function createSubEvent(eventId: string, data: Partial<SubEvent>): Promise<SubEvent> {
  return fetchAPI(`/api/events/${eventId}/sub-events`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Met à jour un sous-événement
 */
export async function updateSubEvent(eventId: string, subEventId: string, data: Partial<SubEvent>): Promise<SubEvent> {
  return fetchAPI(`/api/events/${eventId}/sub-events/${subEventId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Supprime un sous-événement
 */
export async function deleteSubEvent(eventId: string, subEventId: string): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/sub-events/${subEventId}`, {
    method: 'DELETE',
  });
}

/**
 * Réordonne les sous-événements
 */
export async function reorderSubEvents(eventId: string, subEventIds: string[]): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/sub-events/reorder`, {
    method: 'POST',
    body: JSON.stringify({ sub_event_ids: subEventIds }),
  });
}

// ============================================================================
// GROUPES D'INVITATION
// ============================================================================

export interface InvitationGroup {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  color?: string;
  sub_events?: SubEvent[];
  guest_count?: number;
}

/**
 * Liste les groupes d'invitation
 */
export async function getInvitationGroups(eventId: string): Promise<InvitationGroup[]> {
  return fetchAPI(`/api/events/${eventId}/groups`);
}

/**
 * Récupère les templates de groupes
 */
export async function getGroupTemplates(): Promise<any[]> {
  return fetchAPI('/api/events/groups/templates', { requiresAuth: false });
}

/**
 * Crée un groupe d'invitation
 */
export async function createInvitationGroup(eventId: string, data: Partial<InvitationGroup>): Promise<InvitationGroup> {
  return fetchAPI(`/api/events/${eventId}/groups`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Met à jour un groupe
 */
export async function updateInvitationGroup(eventId: string, groupId: string, data: Partial<InvitationGroup>): Promise<InvitationGroup> {
  return fetchAPI(`/api/events/${eventId}/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Supprime un groupe
 */
export async function deleteInvitationGroup(eventId: string, groupId: string): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/groups/${groupId}`, {
    method: 'DELETE',
  });
}

/**
 * Lie des sous-événements à un groupe
 */
export async function linkSubEventsToGroup(
  eventId: string, 
  groupId: string, 
  subEventIds: string[]
): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/groups/${groupId}/sub-events`, {
    method: 'POST',
    body: JSON.stringify({ sub_event_ids: subEventIds }),
  });
}

// ============================================================================
// INVITÉS
// ============================================================================

export interface Guest {
  id: string;
  event_id: string;
  invitation_group_id?: string;
  personal_code?: string;
  name: string;
  first_name?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'declined';
  plus_ones: number;
  dietary?: string;
  allergies?: string;
  created_at: string;
}

export interface RSVPStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  total_attendees: number;
}

/**
 * Liste les invités d'un événement
 */
export async function getGuests(eventId: string): Promise<Guest[]> {
  return fetchAPI(`/api/events/${eventId}/guests`);
}

/**
 * Récupère les stats RSVP
 */
export async function getRSVPStats(eventId: string): Promise<RSVPStats> {
  return fetchAPI(`/api/events/${eventId}/rsvp/stats`);
}

/**
 * Récupère les stats RSVP par sous-événement
 */
export async function getSubEventRSVPStats(eventId: string): Promise<any[]> {
  return fetchAPI(`/api/events/${eventId}/rsvp/stats/sub-events`);
}

/**
 * Met à jour le groupe d'un invité
 */
export async function updateGuestGroup(eventId: string, guestId: string, groupId: string | null): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/guests/${guestId}/group`, {
    method: 'PUT',
    body: JSON.stringify({ group_id: groupId }),
  });
}

/**
 * Génère les codes personnels pour tous les invités
 */
export async function generateGuestCodes(eventId: string): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/guests/generate-codes`, {
    method: 'POST',
  });
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  event_id: string;
  target_group_id?: string;
  title: string;
  message: string;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  opened_count: number;
  created_at: string;
}

/**
 * Liste les notifications d'un événement
 */
export async function getNotifications(eventId: string): Promise<Notification[]> {
  return fetchAPI(`/api/events/${eventId}/notifications`);
}

/**
 * Crée et envoie une notification
 */
export async function sendNotification(
  eventId: string, 
  data: { title: string; message: string; target_group_id?: string; scheduled_at?: string }
): Promise<Notification> {
  return fetchAPI(`/api/events/${eventId}/notifications`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Récupère les stats des notifications
 */
export async function getNotificationStats(eventId: string): Promise<any> {
  return fetchAPI(`/api/events/${eventId}/notifications/stats`);
}

// ============================================================================
// PHOTOS
// ============================================================================

export interface Photo {
  id: string;
  event_id: string;
  uploaded_by: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  approved: boolean;
  created_at: string;
}

/**
 * Liste les photos d'un événement
 */
export async function getPhotos(eventId: string, approvedOnly = false): Promise<Photo[]> {
  const params = new URLSearchParams();
  if (approvedOnly) params.append('approved_only', 'true');
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI(`/api/events/${eventId}/photos${query}`);
}

/**
 * Approuve une photo
 */
export async function approvePhoto(eventId: string, photoId: string): Promise<Photo> {
  return fetchAPI(`/api/events/${eventId}/photos/${photoId}/approve`, {
    method: 'PUT',
  });
}

/**
 * Supprime une photo
 */
export async function deletePhoto(eventId: string, photoId: string): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/photos/${photoId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// DONATIONS
// ============================================================================

export interface DonationStats {
  total_amount: number;
  donation_count: number;
  average_amount: number;
  currency: string;
}

/**
 * Récupère les stats des donations
 */
export async function getDonationStats(eventId: string): Promise<DonationStats> {
  return fetchAPI(`/api/events/${eventId}/donations/stats`);
}

// ============================================================================
// GUESTBOOK
// ============================================================================

export interface GuestbookEntry {
  id: string;
  event_id: string;
  author_name: string;
  message: string;
  photo_url?: string;
  approved: boolean;
  created_at: string;
}

/**
 * Liste les messages du livre d'or
 */
export async function getGuestbookEntries(eventId: string, approvedOnly = false): Promise<GuestbookEntry[]> {
  const params = new URLSearchParams();
  if (approvedOnly) params.append('approved_only', 'true');
  const query = params.toString() ? `?${params}` : '';
  return fetchAPI(`/api/events/${eventId}/guestbook${query}`);
}

/**
 * Approuve un message
 */
export async function approveGuestbookEntry(eventId: string, entryId: string): Promise<GuestbookEntry> {
  return fetchAPI(`/api/events/${eventId}/guestbook/${entryId}/approve`, {
    method: 'PUT',
  });
}

/**
 * Supprime un message
 */
export async function deleteGuestbookEntry(eventId: string, entryId: string): Promise<void> {
  return fetchAPI(`/api/events/${eventId}/guestbook/${entryId}`, {
    method: 'DELETE',
  });
}
