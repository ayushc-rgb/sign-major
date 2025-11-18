import google.generativeai as genai
from typing import Dict, List
import os
import json

class TranslateService:
    def __init__(self):
        """Initialize Gemini API for translation tasks"""
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
            print("🔍 Fetching available Gemini models for translation...")
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
                print(f"✅ Successfully initialized Gemini model for translation: {model_name}")
                return
            except Exception as e:
                print(f"❌ Failed {model_name}: {str(e)}")
                continue
        
        raise Exception(
            "Could not initialize any Gemini model for translation. "
            "Please check your API key at https://aistudio.google.com/app/apikey"
        )
    
    def translate_text(
        self, 
        text: str, 
        target_language: str,
        source_language: str = None
    ) -> Dict[str, str]:
        """
        Translate text to target language using Gemini
        
        Args:
            text: Text to translate
            target_language: Target language code (e.g., 'en', 'es', 'fr')
            source_language: Source language code (optional, auto-detected if not provided)
            
        Returns:
            Dict containing translated text, source language, and target language
        """
        try:
            if not text or not text.strip():
                return {
                    "translated_text": "",
                    "source_language": source_language or "unknown",
                    "target_language": target_language
                }
            
            # Get language name from code
            target_lang_name = self._get_language_name(target_language)
            
            # Create translation prompt
            prompt = f"""Translate the following text to {target_lang_name} ({target_language}).

Text to translate:
{text}

Please provide ONLY the translated text without any explanations, notes, or additional commentary.
If the text is already in {target_lang_name}, return it as is."""

            # Generate translation with retry
            response = None
            last_error = None
            
            for attempt in range(len(self.model_names)):
                try:
                    response = self.model.generate_content(prompt)
                    break
                except Exception as e:
                    last_error = e
                    print(f"Translation attempt {attempt + 1} failed: {str(e)}")
                    if attempt < len(self.model_names) - 1:
                        try:
                            self.model = genai.GenerativeModel(self.model_names[attempt + 1])
                        except:
                            continue
            
            if not response:
                raise Exception(f"Translation failed. Last error: {str(last_error)}")
            
            translated_text = response.text.strip()
            
            # Detect source language if not provided
            if not source_language:
                source_language = self._detect_language_gemini(text)
            
            return {
                "translated_text": translated_text,
                "source_language": source_language,
                "target_language": target_language
            }
            
        except Exception as e:
            raise Exception(f"Failed to translate text with Gemini: {str(e)}")
    
    def _detect_language_gemini(self, text: str) -> str:
        """Detect language using Gemini"""
        try:
            prompt = f"""Identify the language of this text and respond with ONLY the two-letter ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'ja', 'ar', 'zh').

Text: {text}

Response (only the code):"""
            
            response = None
            for attempt in range(3):
                try:
                    response = self.model.generate_content(prompt)
                    break
                except:
                    if attempt < 2:
                        continue
                    return "unknown"
            
            if not response:
                return "unknown"
            
            lang_code = response.text.strip().lower()
            
            # Validate it's a reasonable language code
            if len(lang_code) <= 3:
                return lang_code
            return "unknown"
        except:
            return "unknown"
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """
        Get list of supported languages
        
        Returns:
            List of dictionaries containing language code and name
        """
        # Common languages supported by Gemini
        languages = [
            {"code": "af", "name": "Afrikaans"},
            {"code": "sq", "name": "Albanian"},
            {"code": "am", "name": "Amharic"},
            {"code": "ar", "name": "Arabic"},
            {"code": "hy", "name": "Armenian"},
            {"code": "az", "name": "Azerbaijani"},
            {"code": "eu", "name": "Basque"},
            {"code": "be", "name": "Belarusian"},
            {"code": "bn", "name": "Bengali"},
            {"code": "bs", "name": "Bosnian"},
            {"code": "bg", "name": "Bulgarian"},
            {"code": "ca", "name": "Catalan"},
            {"code": "ceb", "name": "Cebuano"},
            {"code": "ny", "name": "Chichewa"},
            {"code": "zh", "name": "Chinese (Simplified)"},
            {"code": "zh-TW", "name": "Chinese (Traditional)"},
            {"code": "co", "name": "Corsican"},
            {"code": "hr", "name": "Croatian"},
            {"code": "cs", "name": "Czech"},
            {"code": "da", "name": "Danish"},
            {"code": "nl", "name": "Dutch"},
            {"code": "en", "name": "English"},
            {"code": "eo", "name": "Esperanto"},
            {"code": "et", "name": "Estonian"},
            {"code": "tl", "name": "Filipino"},
            {"code": "fi", "name": "Finnish"},
            {"code": "fr", "name": "French"},
            {"code": "fy", "name": "Frisian"},
            {"code": "gl", "name": "Galician"},
            {"code": "ka", "name": "Georgian"},
            {"code": "de", "name": "German"},
            {"code": "el", "name": "Greek"},
            {"code": "gu", "name": "Gujarati"},
            {"code": "ht", "name": "Haitian Creole"},
            {"code": "ha", "name": "Hausa"},
            {"code": "haw", "name": "Hawaiian"},
            {"code": "iw", "name": "Hebrew"},
            {"code": "hi", "name": "Hindi"},
            {"code": "hmn", "name": "Hmong"},
            {"code": "hu", "name": "Hungarian"},
            {"code": "is", "name": "Icelandic"},
            {"code": "ig", "name": "Igbo"},
            {"code": "id", "name": "Indonesian"},
            {"code": "ga", "name": "Irish"},
            {"code": "it", "name": "Italian"},
            {"code": "ja", "name": "Japanese"},
            {"code": "jw", "name": "Javanese"},
            {"code": "kn", "name": "Kannada"},
            {"code": "kk", "name": "Kazakh"},
            {"code": "km", "name": "Khmer"},
            {"code": "ko", "name": "Korean"},
            {"code": "ku", "name": "Kurdish"},
            {"code": "ky", "name": "Kyrgyz"},
            {"code": "lo", "name": "Lao"},
            {"code": "la", "name": "Latin"},
            {"code": "lv", "name": "Latvian"},
            {"code": "lt", "name": "Lithuanian"},
            {"code": "lb", "name": "Luxembourgish"},
            {"code": "mk", "name": "Macedonian"},
            {"code": "mg", "name": "Malagasy"},
            {"code": "ms", "name": "Malay"},
            {"code": "ml", "name": "Malayalam"},
            {"code": "mt", "name": "Maltese"},
            {"code": "mi", "name": "Maori"},
            {"code": "mr", "name": "Marathi"},
            {"code": "mn", "name": "Mongolian"},
            {"code": "my", "name": "Myanmar (Burmese)"},
            {"code": "ne", "name": "Nepali"},
            {"code": "no", "name": "Norwegian"},
            {"code": "ps", "name": "Pashto"},
            {"code": "fa", "name": "Persian"},
            {"code": "pl", "name": "Polish"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "pa", "name": "Punjabi"},
            {"code": "ro", "name": "Romanian"},
            {"code": "ru", "name": "Russian"},
            {"code": "sm", "name": "Samoan"},
            {"code": "gd", "name": "Scots Gaelic"},
            {"code": "sr", "name": "Serbian"},
            {"code": "st", "name": "Sesotho"},
            {"code": "sn", "name": "Shona"},
            {"code": "sd", "name": "Sindhi"},
            {"code": "si", "name": "Sinhala"},
            {"code": "sk", "name": "Slovak"},
            {"code": "sl", "name": "Slovenian"},
            {"code": "so", "name": "Somali"},
            {"code": "es", "name": "Spanish"},
            {"code": "su", "name": "Sundanese"},
            {"code": "sw", "name": "Swahili"},
            {"code": "sv", "name": "Swedish"},
            {"code": "tg", "name": "Tajik"},
            {"code": "ta", "name": "Tamil"},
            {"code": "te", "name": "Telugu"},
            {"code": "th", "name": "Thai"},
            {"code": "tr", "name": "Turkish"},
            {"code": "uk", "name": "Ukrainian"},
            {"code": "ur", "name": "Urdu"},
            {"code": "uz", "name": "Uzbek"},
            {"code": "vi", "name": "Vietnamese"},
            {"code": "cy", "name": "Welsh"},
            {"code": "xh", "name": "Xhosa"},
            {"code": "yi", "name": "Yiddish"},
            {"code": "yo", "name": "Yoruba"},
            {"code": "zu", "name": "Zulu"}
        ]
        
        return languages
    
    def _get_language_name(self, code: str) -> str:
        """Get language name from code"""
        languages = self.get_supported_languages()
        for lang in languages:
            if lang["code"] == code:
                return lang["name"]
        return code.upper()
    
    def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Text to analyze
            
        Returns:
            Detected language code
        """
        return self._detect_language_gemini(text)

translate_service = TranslateService()
