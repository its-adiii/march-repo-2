import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Base directory for the DB file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'jobs.db')

# Setup SQLAlchemy
engine = create_engine(f'sqlite:///{DB_PATH}', echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class JobListing(Base):
    __tablename__ = 'job_listings'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    description = Column(Text, nullable=False)
    skills = Column(Text)
    requirements = Column(Text)
    salary = Column(String)
    type = Column(String)
    experience = Column(String)
    
    # Relationships
    matches = relationship("MatchResult", back_populates="job")

class UserSubmission(Base):
    __tablename__ = 'user_submissions'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    cv_text = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    matches = relationship("MatchResult", back_populates="user")

class MatchResult(Base):
    __tablename__ = 'match_results'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user_submissions.id'))
    job_id = Column(Integer, ForeignKey('job_listings.id'))
    match_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("UserSubmission", back_populates="matches")
    job = relationship("JobListing", back_populates="matches")

# Initialization function
def init_db():
    Base.metadata.create_all(bind=engine)
    print(f"📦 Database initialized at {DB_PATH}")

if __name__ == "__main__":
    init_db()
