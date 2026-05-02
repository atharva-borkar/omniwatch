from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text, ARRAY, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from sqlalchemy import Enum as SQLEnum

from database import Base


# --- ENUMS ---

class MediaType(str, enum.Enum):
    movie = "movie"
    series = "series"
    anime = "anime"


class WatchStatus(str, enum.Enum):
    plan_to_watch = "plan_to_watch"
    watching = "watching"
    completed = "completed"
    dropped = "dropped"
    on_hold = "on_hold"


# --- MODELS ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    watchlist = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), index=True, nullable=False)
    media_type = Column(SQLEnum(MediaType), nullable=False)
    release_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    poster_url = Column(String, nullable=True)
    backdrop_url = Column(String, nullable=True)
    genre = Column(ARRAY(String), nullable=True, default=[])
    community_rating = Column(Float, nullable=True)
    language = Column(String(10), nullable=True, default="en")

    # Flexible JSONB for type-specific metadata
    media_metadata = Column(JSONB, default={})

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    watchlist_entries = relationship("Watchlist", back_populates="media", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="media", cascade="all, delete-orphan")


class Watchlist(Base):
    __tablename__ = "watchlist"
    __table_args__ = (
        # Enforce one entry per (user, media) pair at the DB level
        UniqueConstraint("user_id", "media_id", name="uq_user_media"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Integer, ForeignKey("media.id", ondelete="CASCADE"), nullable=False)

    status = Column(SQLEnum(WatchStatus), default=WatchStatus.plan_to_watch)
    progress = Column(Integer, default=0)
    user_rating = Column(Float, nullable=True)  # 0.5 – 5.0 (star scale)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="watchlist")
    media = relationship("Media", back_populates="watchlist_entries")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Integer, ForeignKey("media.id", ondelete="CASCADE"), nullable=False)
    review_text = Column(Text, nullable=False)
    rating = Column(Float, nullable=True)  # 0.5 – 5.0 stars
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="reviews")
    media = relationship("Media", back_populates="reviews")