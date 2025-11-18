from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import ScanHistory
from app.models.schemas import (
    TranslateRequest,
    TranslateResponse,
    LanguagesResponse,
    Language
)
from app.services.translate_api import translate_service

router = APIRouter()

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    request: TranslateRequest,
    db: Session = Depends(get_db)
):
    """
    Translate text to target language
    
    - **text**: Text to translate
    - **target_language**: Target language code (e.g., 'en', 'es', 'fr')
    - **source_language**: Optional source language code (auto-detected if not provided)
    - **scan_id**: Optional scan ID to update with translation
    """
    try:
        # Translate text
        result = translate_service.translate_text(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        # Update scan record if scan_id provided
        if request.scan_id:
            scan = db.query(ScanHistory).filter(ScanHistory.id == request.scan_id).first()
            if scan:
                scan.translated_text = result["translated_text"]
                scan.target_language = request.target_language
                db.commit()
        
        return TranslateResponse(
            translated_text=result["translated_text"],
            source_language=result["source_language"],
            target_language=result["target_language"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to translate text: {str(e)}")

@router.get("/languages", response_model=LanguagesResponse)
async def get_supported_languages():
    """
    Get list of supported languages for translation
    """
    try:
        languages = translate_service.get_supported_languages()
        
        return LanguagesResponse(
            languages=[Language(**lang) for lang in languages]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get languages: {str(e)}")

