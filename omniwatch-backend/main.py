from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from jose import jwt, JWTError
from typing import Optional, List
import os
from dotenv import load_dotenv

import models
import schemas
import utils
from database import engine, SessionLocal

load_dotenv()

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="OmniWatch API", version="2.0.0")

# --- CORS ---
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
cors_origins = [o.strip() for o in cors_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"http://localhost:\d+",  # Allow any localhost port in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB DEPENDENCY ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTH ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_user(token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="login", auto_error=False)), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            return None
        return db.query(models.User).filter(models.User.id == user_id).first()
    except JWTError:
        return None

# ─── ROOT ─────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "OmniWatch API v2.0 - Running"}

# ─── AUTH ROUTES ──────────────────────────────────────────────────

@app.post("/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed_pwd = utils.hash_password(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user or not utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials")
    access_token = utils.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "username": user.username}

@app.get("/me", response_model=schemas.UserProfile)
def get_me(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    watchlist = db.query(models.Watchlist).filter(models.Watchlist.user_id == current_user.id).all()
    stats = schemas.UserStats(
        total=len(watchlist),
        watching=sum(1 for w in watchlist if w.status == models.WatchStatus.watching),
        completed=sum(1 for w in watchlist if w.status == models.WatchStatus.completed),
        plan_to_watch=sum(1 for w in watchlist if w.status == models.WatchStatus.plan_to_watch),
        dropped=sum(1 for w in watchlist if w.status == models.WatchStatus.dropped),
        on_hold=sum(1 for w in watchlist if w.status == models.WatchStatus.on_hold),
    )
    return schemas.UserProfile(
        id=current_user.id, username=current_user.username, email=current_user.email,
        avatar_url=current_user.avatar_url, created_at=current_user.created_at, stats=stats
    )

# ─── MEDIA ROUTES ─────────────────────────────────────────────────

@app.get("/media/", response_model=List[schemas.MediaResponse])
def get_all_media(
    skip: int = 0, limit: int = 50,
    media_type: Optional[str] = None,
    q: Optional[str] = None,
    genre: Optional[str] = None,
    sort_by: Optional[str] = Query(default="created_at", enum=["created_at", "release_year", "title", "community_rating"]),
    db: Session = Depends(get_db)
):
    query = db.query(models.Media)
    if media_type:
        query = query.filter(models.Media.media_type == media_type)
    if q:
        query = query.filter(models.Media.title.ilike(f"%{q}%"))
    if genre:
        query = query.filter(models.Media.genre.any(genre))
    sort_col = getattr(models.Media, sort_by, models.Media.created_at)
    query = query.order_by(sort_col.desc())
    return query.offset(skip).limit(limit).all()

@app.post("/media/", response_model=schemas.MediaResponse, status_code=status.HTTP_201_CREATED)
def create_media(media: schemas.MediaCreate, db: Session = Depends(get_db)):
    if db.query(models.Media).filter(models.Media.title == media.title).first():
        raise HTTPException(status_code=400, detail="Title already exists in the database")
    new_media = models.Media(**media.model_dump())
    db.add(new_media)
    db.commit()
    db.refresh(new_media)
    return new_media

@app.get("/media/{media_id}", response_model=schemas.MediaResponse)
def get_single_media(media_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Media).filter(models.Media.id == media_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Media not found")
    return item

@app.put("/media/{media_id}", response_model=schemas.MediaResponse)
def update_media(media_id: int, media: schemas.MediaCreate, db: Session = Depends(get_db)):
    item = db.query(models.Media).filter(models.Media.id == media_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Media not found")
    for key, value in media.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

# ─── WATCHLIST ROUTES ─────────────────────────────────────────────

@app.get("/watchlist/", response_model=List[schemas.WatchlistDetailedResponse])
def get_my_watchlist(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Watchlist).filter(models.Watchlist.user_id == current_user.id)
    if status_filter:
        query = query.filter(models.Watchlist.status == status_filter)
    return query.order_by(models.Watchlist.added_at.desc()).all()

@app.post("/watchlist/", response_model=schemas.WatchlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item: schemas.WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not db.query(models.Media).filter(models.Media.id == item.media_id).first():
        raise HTTPException(status_code=404, detail="Media not found")
    if db.query(models.Watchlist).filter(
        models.Watchlist.user_id == current_user.id,
        models.Watchlist.media_id == item.media_id
    ).first():
        raise HTTPException(status_code=400, detail="Already in your watchlist")
    new_entry = models.Watchlist(user_id=current_user.id, **item.model_dump())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@app.patch("/watchlist/{watchlist_id}", response_model=schemas.WatchlistResponse)
def update_watchlist_item(
    watchlist_id: int,
    update_data: schemas.WatchlistUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.Watchlist).filter(
        models.Watchlist.id == watchlist_id,
        models.Watchlist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    # Recalculate community rating for this media
    _recalculate_community_rating(item.media_id, db)
    return item

@app.delete("/watchlist/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.Watchlist).filter(
        models.Watchlist.id == watchlist_id,
        models.Watchlist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    media_id = item.media_id
    db.delete(item)
    db.commit()
    _recalculate_community_rating(media_id, db)
    return

# ─── REVIEWS ROUTES ───────────────────────────────────────────────

@app.get("/media/{media_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_reviews(media_id: int, db: Session = Depends(get_db)):
    if not db.query(models.Media).filter(models.Media.id == media_id).first():
        raise HTTPException(status_code=404, detail="Media not found")
    return db.query(models.Review).filter(
        models.Review.media_id == media_id
    ).order_by(models.Review.created_at.desc()).all()

@app.post("/media/{media_id}/reviews", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    media_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not db.query(models.Media).filter(models.Media.id == media_id).first():
        raise HTTPException(status_code=404, detail="Media not found")
    new_review = models.Review(
        user_id=current_user.id, media_id=media_id,
        review_text=review.review_text, rating=review.rating
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    _recalculate_community_rating(media_id, db)
    return new_review

@app.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    review = db.query(models.Review).filter(
        models.Review.id == review_id,
        models.Review.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    media_id = review.media_id
    db.delete(review)
    db.commit()
    _recalculate_community_rating(media_id, db)
    return

# ─── HELPERS ──────────────────────────────────────────────────────

def _recalculate_community_rating(media_id: int, db: Session):
    """Recalculates the community_rating for a media item from all reviews + watchlist ratings."""
    review_avg = db.query(func.avg(models.Review.rating)).filter(
        models.Review.media_id == media_id,
        models.Review.rating.isnot(None)
    ).scalar()
    watchlist_avg = db.query(func.avg(models.Watchlist.user_rating)).filter(
        models.Watchlist.media_id == media_id,
        models.Watchlist.user_rating.isnot(None)
    ).scalar()
    values = [v for v in [review_avg, watchlist_avg] if v is not None]
    avg = round(sum(values) / len(values), 1) if values else None
    db.query(models.Media).filter(models.Media.id == media_id).update({"community_rating": avg})
    db.commit()