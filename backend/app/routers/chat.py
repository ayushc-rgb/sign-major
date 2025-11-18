from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import google.generativeai as genai
import os

router = APIRouter()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ChatRequest(BaseModel):
    message: str
    sign_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """
    Chat with AI assistant about the detected sign
    
    - **message**: User's question
    - **sign_context**: Context about the detected sign (optional)
    """
    try:
        # Initialize Gemini model
        model_names = [
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro',
            'gemini-pro'
        ]
        
        model = None
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                break
            except:
                continue
        
        if not model:
            raise Exception("Could not initialize Gemini model")
        
        # Build context-aware prompt
        context = ""
        if request.sign_context:
            sign_data = request.sign_context
            context = f"""
You are a helpful AI assistant for Sign Vision, an app that helps people understand signs.

The user just scanned a sign with the following information:
- Sign Type: {sign_data.get('sign_type', 'unknown')}
- Description: {sign_data.get('sign_description', 'N/A')}
- Meaning: {sign_data.get('meaning', 'N/A')}
- Visual Elements: {sign_data.get('visual_elements', 'N/A')}
- Detected Text: {sign_data.get('detected_text', 'No text detected')}
- Language: {sign_data.get('detected_language', 'unknown')}

Use this context to answer the user's questions about this sign. Be helpful, concise, and informative.
If the user asks about something not related to signs, politely redirect them to sign-related questions.
"""
        else:
            context = """
You are a helpful AI assistant for Sign Vision, an app that helps people understand signs.
Help the user with their questions about signs, traffic safety, symbols, and related topics.
Be helpful, concise, and informative.
"""
        
        # Generate response
        prompt = f"{context}\n\nUser question: {request.message}\n\nAssistant:"
        
        response = model.generate_content(prompt)
        
        return ChatResponse(message=response.text.strip())
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat message: {str(e)}"
        )

