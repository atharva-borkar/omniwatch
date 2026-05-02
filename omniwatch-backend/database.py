from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/omniwatch_db"
)

# The Engine - connection pool to PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# The Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The Base class all models will inherit from
Base = declarative_base()