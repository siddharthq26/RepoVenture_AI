from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

engine = create_engine("sqlite:///./opensourceconnect.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True)
    objective = Column(String)
    results = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def save_recommendation(objective, results):
    db = SessionLocal()
    record = SearchHistory(
        objective=objective,
        results=json.dumps(results)
    )
    db.add(record)
    db.commit()
    db.close()

def get_history():
    db = SessionLocal()
    records = db.query(SearchHistory).order_by(
        SearchHistory.created_at.desc()
    ).limit(10).all()
    db.close()
    return [
        {
            "id": r.id,
            "objective": r.objective,
            "created_at": str(r.created_at)
        }
        for r in records
    ]