from PIL import Image
import io
import os
from typing import Tuple

class ImageProcessor:
    def __init__(self, max_size_mb: int = 10):
        """
        Initialize image processor
        
        Args:
            max_size_mb: Maximum allowed image size in MB
        """
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.max_dimension = 4096  # Max dimension for Vision API
    
    def validate_image(self, image_bytes: bytes) -> Tuple[bool, str]:
        """
        Validate image size and format
        
        Args:
            image_bytes: Image bytes
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check size
        if len(image_bytes) > self.max_size_bytes:
            return False, f"Image size exceeds {self.max_size_bytes / 1024 / 1024}MB limit"
        
        # Check if valid image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.verify()
            return True, ""
        except Exception as e:
            return False, f"Invalid image format: {str(e)}"
    
    def process_image(self, image_bytes: bytes) -> bytes:
        """
        Process image: resize if needed, optimize, correct orientation
        
        Args:
            image_bytes: Original image bytes
            
        Returns:
            Processed image bytes
        """
        try:
            # Open image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary (for PNG with transparency, etc.)
            if image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
            
            # Correct orientation based on EXIF data
            image = self._correct_orientation(image)
            
            # Resize if too large
            if max(image.size) > self.max_dimension:
                image = self._resize_image(image, self.max_dimension)
            
            # Save to bytes
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            return output.read()
            
        except Exception as e:
            raise Exception(f"Failed to process image: {str(e)}")
    
    def _correct_orientation(self, image: Image.Image) -> Image.Image:
        """Correct image orientation based on EXIF data"""
        try:
            exif = image._getexif()
            if exif is not None:
                orientation = exif.get(274)  # 274 is the orientation tag
                if orientation == 3:
                    image = image.rotate(180, expand=True)
                elif orientation == 6:
                    image = image.rotate(270, expand=True)
                elif orientation == 8:
                    image = image.rotate(90, expand=True)
        except (AttributeError, KeyError, IndexError):
            # No EXIF data or orientation tag
            pass
        return image
    
    def _resize_image(self, image: Image.Image, max_dimension: int) -> Image.Image:
        """Resize image while maintaining aspect ratio"""
        width, height = image.size
        
        if width > height:
            new_width = max_dimension
            new_height = int(height * (max_dimension / width))
        else:
            new_height = max_dimension
            new_width = int(width * (max_dimension / height))
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

image_processor = ImageProcessor()

