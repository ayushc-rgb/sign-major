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

# Shared model instance
_chat_model = None

def _get_or_initialize_model():
    """Get or initialize Gemini model with fallback"""
    global _chat_model
    
    if _chat_model is not None:
        return _chat_model
    
    model_names = [
        'gemini-flash-latest',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-pro-latest',
        'gemini-2.5-pro',
        'gemini-2.0-pro-exp'
    ]
    
    for model_name in model_names:
        try:
            _chat_model = genai.GenerativeModel(model_name)
            print(f"✓ Chat model initialized: {model_name}")
            return _chat_model
        except Exception as e:
            print(f"✗ Failed to initialize {model_name}: {str(e)}")
            continue
    
    # If all predefined models fail, try to list and use first available
    try:
        available_models = genai.list_models()
        for model in available_models:
            if 'generateContent' in model.supported_generation_methods:
                try:
                    model_name = model.name.replace('models/', '')
                    _chat_model = genai.GenerativeModel(model_name)
                    print(f"✓ Using available model: {model_name}")
                    return _chat_model
                except:
                    continue
    except Exception as e:
        print(f"Failed to list models: {str(e)}")
    
    raise Exception("Could not initialize any Gemini model for chat")

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
        print(f"📩 Chat request received: {request.message}")
        
        # Get or initialize Gemini model
        model = _get_or_initialize_model()
        
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
        
        # Generate response with retry mechanism
        prompt = f"{context}\n\nUser question: {request.message}\n\nAssistant:"
        
        print("🤖 Generating AI response...")
        
        # Try generating content with fallback to other models
        response = None
        last_error = None
        model_names = [
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-pro-latest',
            'gemini-2.5-pro',
            'gemini-2.0-pro-exp'
        ]
        
        for attempt, model_name in enumerate(model_names):
            try:
                temp_model = genai.GenerativeModel(model_name)
                response = temp_model.generate_content(prompt)
                print(f"✓ Response generated with {model_name}")
                # Update global model on success
                global _chat_model
                _chat_model = temp_model
                break
            except Exception as e:
                last_error = e
                print(f"✗ Attempt {attempt + 1} failed with {model_name}: {str(e)}")
                continue
        
        if not response:
            raise Exception(f"All model attempts failed. Last error: {str(last_error)}")
        
        # Extract text from response safely
        response_text = ""
        if hasattr(response, 'text'):
            response_text = response.text
        elif hasattr(response, 'parts'):
            response_text = ''.join([part.text for part in response.parts])
        else:
            response_text = str(response)
        
        print(f"📤 Sending response: {response_text[:100]}...")
        
        return ChatResponse(message=response_text.strip())
        
    except Exception as e:
        error_msg = f"Failed to process chat message: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )

