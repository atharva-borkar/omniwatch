from pydantic import BaseModel, EmailStr, field_validator
from typing import Dict, Any, Optional, List
from datetime import datetime


# ─── USER SCHEMAS ─────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    total: int
    watching: int
    completed: int
    plan_to_watch: int
    dropped: int
    on_hold: int


class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    stats: UserStats

    class Config:
        from_attributes = True


# ─── MEDIA SCHEMAS ────────────────────────────────────────────────

class MediaBase(BaseModel):
    title: str
    media_type: str
    release_year: Optional[int] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    genre: Optional[List[str]] = []
    language: Optional[str] = "en"
    media_metadata: Dict[str, Any] = {}


class MediaCreate(MediaBase):
    pass


class MediaResponse(MediaBase):
    id: int
    community_rating: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MediaSearchResult(BaseModel):
    id: int
    title: str
    media_type: str
    release_year: Optional[int] = None
    poster_url: Optional[str] = None
    genre: Optional[List[str]] = []
    community_rating: Optional[float] = None

    class Config:
        from_attributes = True


# ─── WATCHLIST SCHEMAS ────────────────────────────────────────────

class WatchlistBase(BaseModel):
    status: str = "plan_to_watch"
    progress: int = 0
    user_rating: Optional[float] = None


class WatchlistCreate(WatchlistBase):
    media_id: int


class WatchlistUpdate(BaseModel):
    progress: Optional[int] = None
    status: Optional[str] = None
    user_rating: Optional[float] = None


class WatchlistResponse(WatchlistBase):
    id: int
    user_id: int
    media_id: int
    added_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WatchlistDetailedResponse(BaseModel):
    id: int
    status: str
    progress: int
    user_rating: Optional[float] = None
    added_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    media: MediaResponse

    class Config:
        from_attributes = True


# ─── REVIEW SCHEMAS ───────────────────────────────────────────────

class ReviewCreate(BaseModel):
    review_text: str
    rating: Optional[float] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if v is not None and not (0.5 <= v <= 5.0):
            raise ValueError("Rating must be between 0.5 and 5.0")
        return v

    @field_validator("review_text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Review must be at least 10 characters")
        return v.strip()


class ReviewResponse(BaseModel):
    id: int
    review_text: str
    rating: Optional[float] = None
    created_at: Optional[datetime] = None
    user: UserPublic

    class Config:
        from_attributes = True


# ─── TOKEN SCHEMAS ────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str