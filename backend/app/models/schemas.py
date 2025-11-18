from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class BoundingBox(BaseModel):
    vertices: List[Dict[str, int]]
    
class DetectedText(BaseModel):
    text: str
    language: str
    confidence: float
    bounding_boxes: List[BoundingBox]

class ScanRequest(BaseModel):
    image: str  # Base64 encoded image or URL

class ScanResponse(BaseModel):
    id: Optional[int] = None
    sign_detected: bool
    sign_type: str
    sign_description: str
    visual_elements: str
    meaning: str
    detected_text: str
    detected_language: str
    confidence_score: float
    bounding_boxes: List[Dict[str, Any]]
    
class TranslateRequest(BaseModel):
    text: str
    source_language: Optional[str] = None
    target_language: str = Field(..., min_length=2, max_length=10)
    scan_id: Optional[int] = None

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    
class Language(BaseModel):
    code: str
    name: str

class LanguagesResponse(BaseModel):
    languages: List[Language]

class ScanHistoryItem(BaseModel):
    id: int
    sign_detected: Optional[bool]
    sign_type: Optional[str]
    sign_description: Optional[str]
    visual_elements: Optional[str]
    meaning: Optional[str]
    detected_text: str
    detected_language: str
    translated_text: Optional[str]
    target_language: Optional[str]
    confidence_score: Optional[float]
    bounding_boxes: Optional[List[Dict[str, Any]]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScanHistoryResponse(BaseModel):
    items: List[ScanHistoryItem]
    total: int
    page: int
    page_size: int
    
class DeleteResponse(BaseModel):
    success: bool
    message: str

