"""
Modèles SQLAlchemy pour SaveTheDate
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, 
    DateTime, Numeric, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from core.database import Base


class Event(Base):
    """Table des événements"""
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False)
    type = Column(String(50), nullable=False)  # wedding, bar_mitzvah, etc.
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300))
    event_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    timezone = Column(String(50), default='Europe/Paris')
    languages = Column(JSONB, default=['fr'])
    default_language = Column(String(10), default='fr')
    config = Column(JSONB, nullable=False)  # Le config.json complet
    status = Column(String(20), default='draft')  # draft, pending_review, live, souvenir, expired
    pack = Column(String(20), nullable=False)  # essential, premium, vip
    bundle_id_ios = Column(String(200))
    bundle_id_android = Column(String(200))
    store_url_ios = Column(String(500))
    store_url_android = Column(String(500))
    qr_code_url = Column(String(500))
    client_name = Column(String(200))
    client_email = Column(String(200))
    client_phone = Column(String(50))
    paid_amount = Column(Numeric(10, 2))
    payment_status = Column(String(20), default='pending')  # pending, partial, paid
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))

    # Relations
    guests = relationship("Guest", back_populates="event", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="event", cascade="all, delete-orphan")
    guestbook_entries = relationship("GuestbookEntry", back_populates="event", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="event", cascade="all, delete-orphan")
    push_notifications = relationship("PushNotification", back_populates="event", cascade="all, delete-orphan")
    playlist_suggestions = relationship("PlaylistSuggestion", back_populates="event", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="event", cascade="all, delete-orphan")
    sub_events = relationship("SubEvent", back_populates="event", cascade="all, delete-orphan")
    invitation_groups = relationship("InvitationGroup", back_populates="event", cascade="all, delete-orphan")


class Guest(Base):
    """Table des invités et RSVPs"""
    __tablename__ = "guests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    invitation_group_id = Column(UUID(as_uuid=True), ForeignKey("invitation_groups.id", ondelete="SET NULL"), nullable=True)
    personal_code = Column(String(20), unique=True, nullable=True)  # Code unique pour identifier l'invité
    name = Column(String(200), nullable=False)
    first_name = Column(String(100))  # Prénom séparé pour personnalisation
    email = Column(String(200))
    phone = Column(String(50))
    status = Column(String(20), default='pending')  # pending, confirmed, declined
    plus_ones = Column(Integer, default=0)
    plus_one_names = Column(JSONB, default=[])
    dietary = Column(String(50))  # standard, vegetarian, casher, etc.
    allergies = Column(Text)
    menu_choice = Column(String(50))
    custom_answers = Column(JSONB, default={})
    rsvp_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    event = relationship("Event", back_populates="guests")
    invitation_group = relationship("InvitationGroup", back_populates="guests")
    sub_event_rsvps = relationship("GuestSubEventRsvp", back_populates="guest", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_guests_event', 'event_id'),
        Index('idx_guests_group', 'invitation_group_id'),
        Index('idx_guests_personal_code', 'personal_code'),
    )


class Photo(Base):
    """Table des photos de la galerie"""
    __tablename__ = "photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    uploaded_by = Column(String(200))  # nom de l'invité
    url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    caption = Column(Text)
    approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    event = relationship("Event", back_populates="photos")

    __table_args__ = (
        Index('idx_photos_event', 'event_id'),
    )


class GuestbookEntry(Base):
    """Table des messages du livre d'or"""
    __tablename__ = "guestbook_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    author_name = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    photo_url = Column(String(500))
    approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    event = relationship("Event", back_populates="guestbook_entries")

    __table_args__ = (
        Index('idx_guestbook_event', 'event_id'),
    )


class Donation(Base):
    """Table des dons (cagnotte)"""
    __tablename__ = "donations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    donor_name = Column(String(200))  # null si anonyme
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default='EUR')
    message = Column(Text)
    stripe_payment_id = Column(String(200))
    status = Column(String(20), default='pending')  # pending, completed, failed
    anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    event = relationship("Event", back_populates="donations")

    __table_args__ = (
        Index('idx_donations_event', 'event_id'),
    )


class PushNotification(Base):
    """Table des notifications push"""
    __tablename__ = "push_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    target_group_id = Column(UUID(as_uuid=True), ForeignKey("invitation_groups.id", ondelete="SET NULL"), nullable=True)  # null = tous les invités
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    status = Column(String(20), default='draft')  # draft, scheduled, sent, failed
    opened_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    event = relationship("Event", back_populates="push_notifications")
    target_group = relationship("InvitationGroup")

    __table_args__ = (
        Index('idx_notifications_event', 'event_id'),
    )


class PlaylistSuggestion(Base):
    """Table des suggestions de playlist"""
    __tablename__ = "playlist_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    guest_name = Column(String(200), nullable=False)
    song_title = Column(String(300), nullable=False)
    artist = Column(String(300))
    spotify_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    event = relationship("Event", back_populates="playlist_suggestions")

    __table_args__ = (
        Index('idx_playlist_event', 'event_id'),
    )


class ChatMessage(Base):
    """Table des messages du chat"""
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    sender_name = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    event = relationship("Event", back_populates="chat_messages")

    __table_args__ = (
        Index('idx_chat_event', 'event_id'),
    )


# ============================================================================
# NOUVEAUX MODÈLES POUR LE MARIAGE - GROUPES D'INVITATION
# ============================================================================

class SubEvent(Base):
    """Sous-événements du mariage (Mairie, Henné, Houppa, etc.)"""
    __tablename__ = "sub_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    slug = Column(String(50), nullable=False)  # "mairie", "henne", "houppa", "chabbat", "party"
    name = Column(String(200), nullable=False)  # "Mairie", "Soirée Henné", etc.
    date = Column(DateTime(timezone=True))
    start_time = Column(String(10))  # "15:00"
    end_time = Column(String(10))    # "18:00"
    location_name = Column(String(300))
    location_address = Column(String(500))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    dress_code = Column(String(200))
    notes = Column(Text)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    event = relationship("Event", back_populates="sub_events")
    group_links = relationship("GroupSubEvent", back_populates="sub_event", cascade="all, delete-orphan")
    rsvp_responses = relationship("GuestSubEventRsvp", back_populates="sub_event", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_sub_events_event', 'event_id'),
    )


class InvitationGroup(Base):
    """Groupes d'invitation (Famille proche, Amis, Collègues, etc.)"""
    __tablename__ = "invitation_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"))
    name = Column(String(200), nullable=False)  # "Famille proche", "Amis"
    description = Column(Text)
    color = Column(String(7))  # "#FF5733" pour identifier dans le CMS
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    event = relationship("Event", back_populates="invitation_groups")
    guests = relationship("Guest", back_populates="invitation_group")
    sub_event_links = relationship("GroupSubEvent", back_populates="group", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_invitation_groups_event', 'event_id'),
    )


class GroupSubEvent(Base):
    """Table de liaison : quels sous-événements sont inclus dans quel groupe"""
    __tablename__ = "group_sub_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("invitation_groups.id", ondelete="CASCADE"))
    sub_event_id = Column(UUID(as_uuid=True), ForeignKey("sub_events.id", ondelete="CASCADE"))

    # Relations
    group = relationship("InvitationGroup", back_populates="sub_event_links")
    sub_event = relationship("SubEvent", back_populates="group_links")

    __table_args__ = (
        Index('idx_group_sub_events_group', 'group_id'),
        Index('idx_group_sub_events_sub_event', 'sub_event_id'),
    )


class GuestSubEventRsvp(Base):
    """RSVP par sous-événement pour chaque invité"""
    __tablename__ = "guest_sub_event_rsvps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    guest_id = Column(UUID(as_uuid=True), ForeignKey("guests.id", ondelete="CASCADE"))
    sub_event_id = Column(UUID(as_uuid=True), ForeignKey("sub_events.id", ondelete="CASCADE"))
    status = Column(String(20), default='pending')  # pending, confirmed, declined
    attendees_count = Column(Integer, default=1)  # nombre de personnes (invité + accompagnants)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    guest = relationship("Guest", back_populates="sub_event_rsvps")
    sub_event = relationship("SubEvent", back_populates="rsvp_responses")

    __table_args__ = (
        Index('idx_guest_sub_event_rsvps_guest', 'guest_id'),
        Index('idx_guest_sub_event_rsvps_sub_event', 'sub_event_id'),
    )

