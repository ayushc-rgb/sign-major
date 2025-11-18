from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.database.db import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"
    
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String, nullable=True)
    sign_detected = Column(Integer, default=1)  # SQLite uses INTEGER for boolean (0/1)
    sign_type = Column(String(50), default="unknown")
    sign_description = Column(Text, nullable=True)
    visual_elements = Column(Text, nullable=True)
    meaning = Column(Text, nullable=True)
    detected_text = Column(Text, nullable=False)
    detected_language = Column(String(10), nullable=False)
    translated_text = Column(Text, nullable=True)
    target_language = Column(String(10), nullable=True)
    confidence_score = Column(Float, nullable=True)
    bounding_boxes = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ScanHistory(id={self.id}, type={self.sign_type}, language={self.detected_language})>"

