"""
Migration script: adds new columns to existing tables.
Run once: python migrate.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine
from sqlalchemy import text

MIGRATIONS = [
    # media table - new columns
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS description TEXT",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS poster_url TEXT",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS backdrop_url TEXT",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS genre TEXT[]",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS community_rating FLOAT",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en'",
    "ALTER TABLE media ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",

    # users table - new columns
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",

    # watchlist table - new columns and types
    "ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ DEFAULT NOW()",
    "ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",

    # Add unique constraint on watchlist (user_id, media_id) if not exists
    """
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_media'
      ) THEN
        ALTER TABLE watchlist ADD CONSTRAINT uq_user_media UNIQUE (user_id, media_id);
      END IF;
    END$$
    """,

    # reviews table - new columns
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating FLOAT",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",

    # Rename 'status' column type if it was plain String (safe no-op if already correct)
    # watchlist status - ensure it accepts the new enum values
    "ALTER TABLE watchlist ALTER COLUMN status TYPE TEXT",
    "ALTER TABLE watchlist ALTER COLUMN progress SET DEFAULT 0",

    # Drop old watchlist status enum type if it was a native enum (recreate as text)
    # This is safe because we already cast to TEXT above
]

def run_migrations():
    with engine.connect() as conn:
        for sql in MIGRATIONS:
            try:
                conn.execute(text(sql.strip()))
                conn.commit()
                print(f"OK: {sql.strip()[:80]}")
            except Exception as e:
                conn.rollback()
                print(f"SKIP (already applied or error): {str(e)[:120]}")

if __name__ == "__main__":
    print("Running migrations...")
    run_migrations()
    print("Done.")
