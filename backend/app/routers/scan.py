from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.database.db import get_db
from app.database.models import ScanHistory
# Note: Database imports kept for history endpoints only
from app.models.schemas import (
    ScanResponse, 
    ScanHistoryResponse, 
    ScanHistoryItem,
    DeleteResponse
)
from app.services.vision_api import vision_service
from app.services.image_processor import image_processor

router = APIRouter()

@router.post("/scan", response_model=ScanResponse)
async def scan_image(
    file: UploadFile = File(...)
):
    """
    Scan an image and detect signs using Gemini AI Vision
    
    - **file**: Image file (JPEG, PNG, WebP)
    - No database storage - returns results directly
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Validate image
        is_valid, error_message = image_processor.validate_image(image_bytes)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Process image
        processed_image = image_processor.process_image(image_bytes)
        
        # Detect sign and extract information
        result = vision_service.detect_text(processed_image)
        
        # Safety check: ensure required fields are not None
        sign_detected = result.get("sign_detected", False)
        sign_type = result.get("sign_type") or "unknown"
        sign_description = result.get("sign_description") or ""
        visual_elements = result.get("visual_elements") or ""
        meaning = result.get("meaning") or ""
        detected_text = result.get("detected_text") or ""
        detected_language = result.get("detected_language") or "unknown"
        confidence_score = result.get("confidence_score", 0.0)
        bounding_boxes = result.get("bounding_boxes", [])
        
        # Return results directly without database storage
        return ScanResponse(
            id=None,  # No database ID
            sign_detected=sign_detected,
            sign_type=sign_type,
            sign_description=sign_description,
            visual_elements=visual_elements,
            meaning=meaning,
            detected_text=detected_text,
            detected_language=detected_language,
            confidence_score=confidence_score,
            bounding_boxes=bounding_boxes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@router.get("/history", response_model=ScanHistoryResponse)
async def get_scan_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    language: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get scan history with pagination and optional language filter
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **language**: Optional language code filter
    """
    try:
        # Build query
        query = db.query(ScanHistory)
        
        if language:
            query = query.filter(
                (ScanHistory.detected_language == language) | 
                (ScanHistory.target_language == language)
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        items = query.order_by(ScanHistory.created_at.desc()).offset(offset).limit(page_size).all()
        
        return ScanHistoryResponse(
            items=[ScanHistoryItem.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")

@router.delete("/history/{scan_id}", response_model=DeleteResponse)
async def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a scan from history
    
    - **scan_id**: ID of the scan to delete
    """
    try:
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        db.delete(scan)
        db.commit()
        
        return DeleteResponse(
            success=True,
            message=f"Scan {scan_id} deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete scan: {str(e)}")

@router.get("/scan/{scan_id}", response_model=ScanHistoryItem)
async def get_scan(
    scan_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific scan by ID
    
    - **scan_id**: ID of the scan to retrieve
    """
    try:
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        return ScanHistoryItem.model_validate(scan)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve scan: {str(e)}")

