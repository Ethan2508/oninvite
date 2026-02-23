"""
Schemas Pydantic pour la validation des données
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from decimal import Decimal


# ============================================
# EVENT SCHEMAS
# ============================================

class EventBase(BaseModel):
    """Base pour les événements"""
    slug: str
    type: str
    title: str
    subtitle: Optional[str] = None
    event_date: datetime
    end_date: Optional[datetime] = None
    timezone: str = "Europe/Paris"
    languages: List[str] = ["fr"]
    default_language: str = "fr"
    pack: str  # essential, premium, vip


class EventCreate(EventBase):
    """Création d'un événement"""
    config: Dict[str, Any]
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None


class EventUpdate(BaseModel):
    """Mise à jour d'un événement"""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    event_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class EventResponse(EventBase):
    """Réponse événement"""
    id: UUID
    config: Dict[str, Any]
    status: str
    store_url_ios: Optional[str] = None
    store_url_android: Optional[str] = None
    qr_code_url: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    payment_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventConfigResponse(BaseModel):
    """Réponse config pour l'app mobile"""
    config: Dict[str, Any]

    class Config:
        from_attributes = True


# ============================================
# GUEST / RSVP SCHEMAS
# ============================================

class GuestBase(BaseModel):
    """Base pour les invités"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class RSVPCreate(GuestBase):
    """Soumission d'un RSVP"""
    attending: bool = True
    plus_ones: int = 0
    plus_one_names: List[str] = []
    dietary: Optional[str] = None
    allergies: Optional[str] = None
    menu_choice: Optional[str] = None
    custom_answers: Dict[str, Any] = {}


class GuestUpdate(BaseModel):
    """Mise à jour d'un invité"""
    name: Optional[str] = None
    first_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    plus_ones: Optional[int] = None
    dietary: Optional[str] = None
    menu_choice: Optional[str] = None
    invitation_group_id: Optional[UUID] = None


class GuestResponse(GuestBase):
    """Réponse invité"""
    id: UUID
    event_id: UUID
    invitation_group_id: Optional[UUID] = None
    personal_code: Optional[str] = None
    first_name: Optional[str] = None
    status: str
    plus_ones: int
    plus_one_names: List[str]
    dietary: Optional[str] = None
    allergies: Optional[str] = None
    menu_choice: Optional[str] = None
    custom_answers: Dict[str, Any]
    rsvp_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RSVPStats(BaseModel):
    """Statistiques RSVP"""
    total: int
    confirmed: int
    declined: int
    pending: int
    total_with_plus_ones: int
    dietary_breakdown: Dict[str, int]
    menu_breakdown: Dict[str, int]


# ============================================
# PHOTO SCHEMAS
# ============================================

class PhotoBase(BaseModel):
    """Base pour les photos"""
    uploaded_by: Optional[str] = None
    caption: Optional[str] = None


class PhotoCreate(PhotoBase):
    """Upload de photo"""
    pass  # Le fichier est envoyé en multipart


class PhotoResponse(PhotoBase):
    """Réponse photo"""
    id: UUID
    event_id: UUID
    url: str
    thumbnail_url: Optional[str] = None
    approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# GUESTBOOK SCHEMAS
# ============================================

class GuestbookEntryBase(BaseModel):
    """Base pour les entrées du livre d'or"""
    author_name: str
    message: str


class GuestbookEntryCreate(GuestbookEntryBase):
    """Création d'une entrée"""
    photo_url: Optional[str] = None


class GuestbookEntryResponse(GuestbookEntryBase):
    """Réponse entrée livre d'or"""
    id: UUID
    event_id: UUID
    photo_url: Optional[str] = None
    approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# DONATION SCHEMAS
# ============================================

class DonationBase(BaseModel):
    """Base pour les dons"""
    amount: Decimal = Field(..., gt=0)
    currency: str = "EUR"
    message: Optional[str] = None


class DonationCreate(DonationBase):
    """Création d'un don"""
    donor_name: Optional[str] = None
    anonymous: bool = False


class DonationResponse(DonationBase):
    """Réponse don"""
    id: UUID
    event_id: UUID
    donor_name: Optional[str] = None
    status: str
    anonymous: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DonationStats(BaseModel):
    """Statistiques des dons"""
    total_amount: Decimal
    total_count: int
    currency: str


class PaymentIntentResponse(BaseModel):
    """Réponse création PaymentIntent Stripe"""
    client_secret: str
    payment_intent_id: str


# ============================================
# NOTIFICATION SCHEMAS
# ============================================

class NotificationBase(BaseModel):
    """Base pour les notifications"""
    title: str
    message: str


class NotificationCreate(NotificationBase):
    """Création d'une notification"""
    scheduled_at: Optional[datetime] = None


class NotificationResponse(NotificationBase):
    """Réponse notification"""
    id: UUID
    event_id: UUID
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    status: str
    opened_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# PLAYLIST SCHEMAS
# ============================================

class PlaylistSuggestionBase(BaseModel):
    """Base pour les suggestions de playlist"""
    guest_name: str
    song_title: str
    artist: Optional[str] = None


class PlaylistSuggestionCreate(PlaylistSuggestionBase):
    """Création d'une suggestion"""
    spotify_url: Optional[str] = None


class PlaylistSuggestionResponse(PlaylistSuggestionBase):
    """Réponse suggestion"""
    id: UUID
    event_id: UUID
    spotify_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# CHAT SCHEMAS
# ============================================

class ChatMessageBase(BaseModel):
    """Base pour les messages chat"""
    sender_name: str
    message: str


class ChatMessageCreate(ChatMessageBase):
    """Création d'un message"""
    pass


class ChatMessageResponse(ChatMessageBase):
    """Réponse message"""
    id: UUID
    event_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# SEATING SCHEMAS
# ============================================

class SeatingSearchResult(BaseModel):
    """Résultat de recherche de table"""
    found: bool
    table_name: Optional[str] = None
    guest_name: Optional[str] = None
    message: str


# ============================================
# SUB-EVENTS SCHEMAS (Mariage)
# ============================================

class SubEventBase(BaseModel):
    """Base pour les sous-événements"""
    slug: str  # "mairie", "henne", "houppa", etc.
    name: str
    date: Optional[datetime] = None
    start_time: Optional[str] = None  # "15:00"
    end_time: Optional[str] = None    # "18:00"
    location_name: Optional[str] = None
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dress_code: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0


class SubEventCreate(SubEventBase):
    """Création d'un sous-événement"""
    pass


class SubEventUpdate(BaseModel):
    """Mise à jour d'un sous-événement"""
    slug: Optional[str] = None
    name: Optional[str] = None
    date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location_name: Optional[str] = None
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dress_code: Optional[str] = None
    notes: Optional[str] = None
    sort_order: Optional[int] = None


class SubEventResponse(SubEventBase):
    """Réponse sous-événement"""
    id: UUID
    event_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# INVITATION GROUPS SCHEMAS
# ============================================

class InvitationGroupBase(BaseModel):
    """Base pour les groupes d'invitation"""
    name: str
    description: Optional[str] = None
    color: Optional[str] = None  # "#FF5733"


class InvitationGroupCreate(InvitationGroupBase):
    """Création d'un groupe avec ses sous-événements"""
    sub_event_ids: List[UUID] = []


class InvitationGroupUpdate(BaseModel):
    """Mise à jour d'un groupe"""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    sub_event_ids: Optional[List[UUID]] = None


class InvitationGroupResponse(InvitationGroupBase):
    """Réponse groupe d'invitation"""
    id: UUID
    event_id: UUID
    sub_events: List[SubEventResponse] = []
    guest_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class GroupSubEventsUpdate(BaseModel):
    """Mise à jour des sous-événements d'un groupe"""
    sub_event_ids: List[UUID]


# ============================================
# PERSONALIZED PROGRAM SCHEMAS
# ============================================

class SubEventProgram(BaseModel):
    """Sous-événement dans le programme personnalisé"""
    slug: str
    name: str
    date: Optional[str] = None  # "2026-06-14"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location_name: Optional[str] = None
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dress_code: Optional[str] = None
    notes: Optional[str] = None
    rsvp_status: str = "pending"  # pending, confirmed, declined
    attendees_count: int = 1


class PersonalizedProgram(BaseModel):
    """Programme personnalisé pour un invité"""
    guest_id: UUID
    guest_name: str
    first_name: Optional[str] = None
    group_name: str
    sub_events: List[SubEventProgram]
    rsvp_deadline: Optional[datetime] = None
    global_rsvp_status: str = "pending"


class GuestIdentification(BaseModel):
    """Identification d'un invité"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class GuestIdentificationResponse(BaseModel):
    """Réponse identification invité"""
    found: bool
    personal_code: Optional[str] = None
    guest_name: Optional[str] = None
    multiple_matches: bool = False
    message: str


# ============================================
# RSVP PER SUB-EVENT SCHEMAS
# ============================================

class SubEventRsvpItem(BaseModel):
    """RSVP pour un sous-événement"""
    sub_event_id: UUID
    status: str  # confirmed, declined
    attendees_count: int = 1


class SubEventRsvpCreate(BaseModel):
    """Soumission RSVP par sous-événements"""
    dietary: Optional[str] = None
    allergies: Optional[str] = None
    custom_answers: Dict[str, Any] = {}
    sub_event_rsvps: List[SubEventRsvpItem]


class SubEventRsvpStats(BaseModel):
    """Stats RSVP par sous-événement"""
    sub_event_id: UUID
    sub_event_name: str
    confirmed: int
    declined: int
    pending: int
    total_attendees: int


# ============================================
# GUEST IMPORT/EXPORT SCHEMAS
# ============================================

class GuestImportResult(BaseModel):
    """Résultat d'import d'invités"""
    total_rows: int
    imported: int
    updated: int
    errors: List[str]


class QRCodeExportRequest(BaseModel):
    """Demande d'export QR codes"""
    guest_ids: Optional[List[UUID]] = None  # null = tous les invités
    base_url: str = "https://oninvite.fr"


# ============================================
# COMMON SCHEMAS
# ============================================

class PaginatedResponse(BaseModel):
    """Réponse paginée générique"""
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int


class SuccessResponse(BaseModel):
    """Réponse de succès"""
    success: bool = True
    message: str = "Operation successful"


class ErrorResponse(BaseModel):
    """Réponse d'erreur"""
    success: bool = False
    error: str
    detail: Optional[str] = None
