import google.generativeai as genai
from typing import Dict, List, Any
import os
import base64
from PIL import Image
import io
import json
import re

class VisionService:
    def __init__(self):
        """Initialize Gemini API for vision tasks"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        
        # Try multiple model versions for compatibility
        self.model_names = [
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro',
            'gemini-pro-vision',
            'gemini-pro'
        ]
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Try to initialize with available model versions"""
        # Updated model names for current Gemini API
        updated_models = [
            'gemini-1.5-flash-002',
            'gemini-1.5-flash-001', 
            'gemini-1.5-pro-002',
            'gemini-1.5-pro-001',
        ]
        
        # First, try to list available models to get the correct names
        try:
            print("🔍 Fetching available Gemini models...")
            available_models = genai.list_models()
            working_models = []
            
            for model in available_models:
                if 'generateContent' in model.supported_generation_methods:
                    model_name = model.name.replace('models/', '')
                    working_models.append(model_name)
                    print(f"  ✓ Available: {model_name}")
            
            if working_models:
                # Prioritize discovered models
                self.model_names = working_models + updated_models + self.model_names
        except Exception as e:
            print(f"⚠️  Could not list models: {str(e)}")
            # Use updated model names as fallback
            self.model_names = updated_models + self.model_names
        
        # Now try each model
        for model_name in self.model_names:
            try:
                print(f"🧪 Testing model: {model_name}")
                self.model = genai.GenerativeModel(model_name)
                print(f"✅ Successfully initialized Gemini model: {model_name}")
                return
            except Exception as e:
                print(f"❌ Failed {model_name}: {str(e)}")
                continue
        
        raise Exception(
            "Could not initialize any Gemini model. "
            "Please check your API key at https://aistudio.google.com/app/apikey "
            "and verify it has access to Gemini models."
        )
    
    def detect_text(self, image_content: bytes) -> Dict[str, Any]:
        """
        Detect text in an image using Gemini API
        
        Args:
            image_content: Image bytes
            
        Returns:
            Dict containing detected text, language, confidence, and bounding boxes
        """
        try:
            result = self._detect_text_internal(image_content)
            
            # Safety check: ensure we never return None for required fields
            if result.get("sign_detected") is None:
                result["sign_detected"] = False
            if result.get("sign_type") is None or result.get("sign_type") == "":
                result["sign_type"] = "unknown"
            if result.get("sign_description") is None:
                result["sign_description"] = ""
            if result.get("detected_language") is None or result.get("detected_language") == "":
                result["detected_language"] = "unknown"
            if result.get("detected_text") is None:
                result["detected_text"] = ""
            if result.get("visual_elements") is None:
                result["visual_elements"] = ""
            if result.get("meaning") is None:
                result["meaning"] = ""
            if result.get("confidence_score") is None:
                result["confidence_score"] = 0.0
            if result.get("bounding_boxes") is None:
                result["bounding_boxes"] = []
                
            return result
        except Exception as e:
            # If everything fails, return a safe empty result
            print(f"⚠️ Vision API error: {str(e)}")
            return {
                "sign_detected": False,
                "sign_type": "error",
                "sign_description": f"Failed to analyze image: {str(e)[:100]}",
                "detected_text": "",
                "detected_language": "unknown",
                "visual_elements": "",
                "meaning": "",
                "confidence_score": 0.0,
                "bounding_boxes": []
            }
    
    def _detect_text_internal(self, image_content: bytes) -> Dict[str, Any]:
        """Internal method for text detection"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_content))
            
            # Create prompt for comprehensive sign detection
            prompt = """Analyze this image and identify any signs present. Signs can include:
- Traffic signs (stop, yield, speed limit, directional, etc.)
- Warning signs (caution, danger, prohibited actions)
- Informational signs (restroom, exit, parking, wheelchair access)
- Commercial signs (store names, advertisements)
- Safety signs (fire exit, first aid, emergency)
- Navigation signs (arrows, waypoints, landmarks)
- Regulatory signs (no smoking, no entry, etc.)

Identify signs by their:
- Visual symbols and icons
- Shapes (octagon for stop, triangle for warning, circle for regulatory, etc.)
- Colors (red for danger/stop, yellow for caution, blue for information, green for safety)
- Text (if present)
- Overall meaning and purpose

Please provide your response in the following JSON format:
{
    "sign_detected": true/false,
    "sign_type": "type of sign (e.g., traffic, warning, informational, commercial, safety, navigation, regulatory)",
    "sign_description": "detailed description of what the sign is and what it means",
    "detected_text": "any text found on the sign (can be empty if sign has no text)",
    "language_code": "two-letter ISO language code of the text (e.g., 'en', 'es', 'fr', 'ja', 'ar') or 'none' if no text",
    "visual_elements": "description of colors, shapes, symbols, icons present",
    "meaning": "what the sign communicates or instructs",
    "confidence": 0.95,
    "text_regions": [
        {
            "text": "individual text segment",
            "position": "approximate position description"
        }
    ]
}

Important:
- ALWAYS try to identify the sign, even without text
- Describe visual elements like shapes, colors, symbols, icons
- Explain what the sign means or communicates
- If it's a universal symbol (wheelchair, no smoking, etc.), identify it
- Extract any text if present, but text is NOT required
- Provide a confidence score between 0 and 1
- If no sign is detected, set sign_detected to false and provide a brief description of the image
"""
            
            # Generate response with image - try with retry on different models
            response = None
            last_error = None
            
            for attempt in range(len(self.model_names)):
                try:
                    response = self.model.generate_content([prompt, image])
                    break
                except Exception as e:
                    last_error = e
                    print(f"Attempt {attempt + 1} failed with {self.model.model_name}: {str(e)}")
                    # Try next model
                    if attempt < len(self.model_names) - 1:
                        try:
                            self.model = genai.GenerativeModel(self.model_names[attempt + 1])
                            print(f"Retrying with {self.model_names[attempt + 1]}")
                        except:
                            continue
            
            if not response:
                raise Exception(f"All model attempts failed. Last error: {str(last_error)}")
            
            # Parse the response
            result_text = response.text.strip()
            
            # Try to extract JSON from the response
            try:
                # Remove markdown code blocks if present
                if "```json" in result_text:
                    result_text = result_text.split("```json")[1].split("```")[0].strip()
                elif "```" in result_text:
                    result_text = result_text.split("```")[1].split("```")[0].strip()
                
                result = json.loads(result_text)
                
                # Extract data with fallbacks
                sign_detected = result.get("sign_detected", True)
                sign_type = result.get("sign_type", "unknown")
                sign_description = result.get("sign_description", "")
                detected_text = result.get("detected_text", "")
                language_code = result.get("language_code", "unknown")
                if language_code == "none":
                    language_code = "unknown"
                visual_elements = result.get("visual_elements", "")
                meaning = result.get("meaning", "")
                confidence = float(result.get("confidence", 0.9))
                text_regions = result.get("text_regions", [])
                
                # Convert text regions to bounding boxes format
                bounding_boxes = []
                for idx, region in enumerate(text_regions):
                    # Create pseudo-coordinates based on text position
                    # Since Gemini doesn't provide exact coordinates, we create placeholders
                    bounding_boxes.append({
                        "text": region.get("text", ""),
                        "vertices": self._generate_pseudo_coordinates(idx, len(text_regions))
                    })
                
                return {
                    "sign_detected": sign_detected,
                    "sign_type": sign_type,
                    "sign_description": sign_description,
                    "detected_text": detected_text,
                    "detected_language": language_code,
                    "visual_elements": visual_elements,
                    "meaning": meaning,
                    "confidence_score": confidence,
                    "bounding_boxes": bounding_boxes
                }
                
            except (json.JSONDecodeError, ValueError) as e:
                # Fallback: extract text directly from response
                print(f"JSON parsing failed, using fallback: {e}")
                
                # Simple text extraction
                detected_text = result_text
                
                # Try to detect language from content
                language_code = self._detect_language_from_text(detected_text)
                
                return {
                    "sign_detected": bool(detected_text or result_text),
                    "sign_type": "unknown",
                    "sign_description": result_text[:200] if result_text else "Unable to analyze sign",
                    "detected_text": detected_text or "",
                    "detected_language": language_code or "unknown",
                    "visual_elements": "Unable to parse detailed visual information",
                    "meaning": result_text[:200] if result_text else "",
                    "confidence_score": 0.85,
                    "bounding_boxes": []
                }
            
        except Exception as e:
            # Return safe defaults instead of raising
            print(f"⚠️ Text detection failed: {str(e)}")
            return {
                "sign_detected": False,
                "sign_type": "error",
                "sign_description": f"Error analyzing image: {str(e)[:100]}",
                "detected_text": "",
                "detected_language": "unknown",
                "visual_elements": "",
                "meaning": "",
                "confidence_score": 0.0,
                "bounding_boxes": []
            }
    
    def _generate_pseudo_coordinates(self, index: int, total: int) -> List[Dict[str, int]]:
        """Generate pseudo-coordinates for text regions"""
        # Create simple top-to-bottom layout
        height_per_region = 100
        y_offset = index * height_per_region
        
        return [
            {"x": 10, "y": y_offset},
            {"x": 590, "y": y_offset},
            {"x": 590, "y": y_offset + 80},
            {"x": 10, "y": y_offset + 80}
        ]
    
    def _detect_language_from_text(self, text: str) -> str:
        """Simple language detection based on character patterns"""
        if not text:
            return "unknown"
        
        # Check for common language patterns
        if re.search(r'[\u4e00-\u9fff]', text):  # Chinese
            return "zh"
        elif re.search(r'[\u3040-\u309f\u30a0-\u30ff]', text):  # Japanese
            return "ja"
        elif re.search(r'[\u0600-\u06ff]', text):  # Arabic
            return "ar"
        elif re.search(r'[\u0400-\u04ff]', text):  # Cyrillic
            return "ru"
        elif re.search(r'[\u0e00-\u0e7f]', text):  # Thai
            return "th"
        elif re.search(r'[\u0900-\u097f]', text):  # Hindi
            return "hi"
        elif re.search(r'[\u0980-\u09ff]', text):  # Bengali
            return "bn"
        else:
            # Default to English for Latin script
            return "en"

vision_service = VisionService()
