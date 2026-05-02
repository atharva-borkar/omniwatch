"""
OmniWatch Database Seed Script
Run this once to populate the database with sample data.
Usage: python seed.py
"""
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

SAMPLE_MEDIA = [
    # ── MOVIES ──────────────────────────────────────────────────
    {
        "title": "Inception",
        "media_type": "movie",
        "release_year": 2010,
        "description": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        "poster_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        "genre": ["Sci-Fi", "Thriller", "Action"],
        "language": "en",
        "media_metadata": {"director": "Christopher Nolan", "runtime_minutes": 148, "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]},
    },
    {
        "title": "The Dark Knight",
        "media_type": "movie",
        "release_year": 2008,
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsqX7an5lu.jpg",
        "genre": ["Action", "Crime", "Drama"],
        "language": "en",
        "media_metadata": {"director": "Christopher Nolan", "runtime_minutes": 152, "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart"]},
    },
    {
        "title": "Interstellar",
        "media_type": "movie",
        "release_year": 2014,
        "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/pbrkL804EoL1z19mSGVL8GsWMrD.jpg",
        "genre": ["Sci-Fi", "Drama", "Adventure"],
        "language": "en",
        "media_metadata": {"director": "Christopher Nolan", "runtime_minutes": 169, "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]},
    },
    {
        "title": "Parasite",
        "media_type": "movie",
        "release_year": 2019,
        "description": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
        "genre": ["Drama", "Thriller", "Comedy"],
        "language": "ko",
        "media_metadata": {"director": "Bong Joon-ho", "runtime_minutes": 132, "cast": ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"]},
    },
    {
        "title": "Dune",
        "media_type": "movie",
        "release_year": 2021,
        "description": "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
        "poster_url": "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
        "genre": ["Sci-Fi", "Adventure", "Drama"],
        "language": "en",
        "media_metadata": {"director": "Denis Villeneuve", "runtime_minutes": 155, "cast": ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"]},
    },
    # ── ANIME ────────────────────────────────────────────────────
    {
        "title": "Attack on Titan",
        "media_type": "anime",
        "release_year": 2013,
        "description": "After his hometown is destroyed and his mother is killed, young Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
        "poster_url": "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/mD8yl4m0TT8s7EZ6oJEMcIFJsL8.jpg",
        "genre": ["Action", "Dark Fantasy", "Drama"],
        "language": "ja",
        "media_metadata": {"studio": "Wit Studio / MAPPA", "total_episodes": 87, "status": "Completed"},
    },
    {
        "title": "Fullmetal Alchemist: Brotherhood",
        "media_type": "anime",
        "release_year": 2009,
        "description": "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.",
        "poster_url": "https://image.tmdb.org/t/p/w500/2UjLEMZfDHna991noEFiVJSlaGP.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/j3iLR0CJbzIlJpPq9rTcsMvYjIM.jpg",
        "genre": ["Action", "Adventure", "Fantasy"],
        "language": "ja",
        "media_metadata": {"studio": "Bones", "total_episodes": 64, "status": "Completed"},
    },
    {
        "title": "Death Note",
        "media_type": "anime",
        "release_year": 2006,
        "description": "An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.",
        "poster_url": "https://image.tmdb.org/t/p/w500/g0ns1ZDTmr9g6fCcLbZRXdRfhMG.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/sTB7Rn5AkrWpGrHvCEMXtCgNM2n.jpg",
        "genre": ["Psychological", "Thriller", "Mystery"],
        "language": "ja",
        "media_metadata": {"studio": "Madhouse", "total_episodes": 37, "status": "Completed"},
    },
    {
        "title": "Demon Slayer",
        "media_type": "anime",
        "release_year": 2019,
        "description": "A young boy who sells charcoal for a living finds his family slaughtered by a demon. To make matters worse, his sister survives but has been transformed into a demon herself.",
        "poster_url": "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/qs5CTEQHtL1ywDuAksDPgbGk7MK.jpg",
        "genre": ["Action", "Fantasy", "Historical"],
        "language": "ja",
        "media_metadata": {"studio": "ufotable", "total_episodes": 44, "status": "Ongoing"},
    },
    {
        "title": "Steins;Gate",
        "media_type": "anime",
        "release_year": 2011,
        "description": "A self-proclaimed mad scientist discovers that he has accidentally created a time machine. His discovery attracts the attention of the shady SERN organization.",
        "poster_url": "https://image.tmdb.org/t/p/w500/kaYgHKnChwPhb6B3NtrCRBtCfXg.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/6bCNMNkxFjhVPODFcl1G5RonUzB.jpg",
        "genre": ["Sci-Fi", "Thriller", "Drama"],
        "language": "ja",
        "media_metadata": {"studio": "White Fox", "total_episodes": 24, "status": "Completed"},
    },
    # ── SERIES ───────────────────────────────────────────────────
    {
        "title": "Breaking Bad",
        "media_type": "series",
        "release_year": 2008,
        "description": "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
        "poster_url": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        "genre": ["Crime", "Drama", "Thriller"],
        "language": "en",
        "media_metadata": {"seasons": 5, "total_episodes": 62, "status": "Completed", "network": "AMC"},
    },
    {
        "title": "Chernobyl",
        "media_type": "series",
        "release_year": 2019,
        "description": "A dramatization of the catastrophic nuclear accident that occurred at the Chernobyl Nuclear Power Plant in Ukraine in April 1986.",
        "poster_url": "https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/hzNnP0LGXUdADFjPEGDDDlpMNmX.jpg",
        "genre": ["Drama", "History", "Thriller"],
        "language": "en",
        "media_metadata": {"seasons": 1, "total_episodes": 5, "status": "Completed", "network": "HBO"},
    },
]

def seed():
    db = SessionLocal()
    try:
        added = 0
        skipped = 0
        for data in SAMPLE_MEDIA:
            existing = db.query(models.Media).filter(models.Media.title == data["title"]).first()
            if existing:
                skipped += 1
                continue
            media = models.Media(**data)
            db.add(media)
            added += 1
        db.commit()
        print(f"✅ Seed complete: {added} added, {skipped} skipped (already existed)")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
