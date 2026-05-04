import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import io
import base64
from typing import List, Dict, Tuple
import colorsys
import uuid
from pathlib import Path

class InteriorDesignProcessor:
    """Advanced interior design image processor with wall/door detection and realistic texture mapping"""
    
    def __init__(self):
        self.color_palettes = {
            'modern': ['#E8E8E8', '#3A3A3A', '#4A90E2', '#F5F5F5'],
            'minimal': ['#FAFAFA', '#808080', '#B0B0B0', '#FFFFFF'],
            'bold': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
            'neutral': ['#D4AF88', '#A68968', '#8B8680', '#C9B59A'],
            'warm': ['#F4A460', '#CD853F', '#DAA520', '#DEB887']
        }
        
        self.texture_types = [
            'matte', 'glossy', 'wood_light', 'wood_dark', 
            'marble', 'concrete', 'brick', 'wallpaper_subtle'
        ]
        
    def detect_segments(self, image_array: np.ndarray) -> Dict:
        """Detect walls, doors, and surfaces using vision techniques"""
        
        # Convert to RGB if needed
        if len(image_array.shape) == 2:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2BGR)
        elif image_array.shape[2] == 4:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2BGR)
        
        # Edge detection for structural boundaries
        edges = cv2.Canny(image_array, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        # Segment by color clustering
        hsv = cv2.cvtColor(image_array, cv2.COLOR_BGR2HSV)
        
        # Separate by value (brightness) for wall detection
        h, s, v = cv2.split(hsv)
        
        # Walls are typically higher value (brighter)
        wall_mask = cv2.inRange(v, 100, 255)
        
        # Doors are typically darker and have more defined edges
        door_mask = cv2.inRange(v, 0, 100)
        door_mask = cv2.morphologyEx(door_mask, cv2.MORPH_CLOSE, 
                                     cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)))
        
        # Find large rectangles (doors, windows)
        door_contours, _ = cv2.findContours(door_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        door_rects = []
        for cnt in door_contours:
            x, y, w, h = cv2.boundingRect(cnt)
            area = w * h
            if 100 < area < (image_array.shape[0] * image_array.shape[1] * 0.4):
                door_rects.append((x, y, w, h))
        
        return {
            'wall_mask': wall_mask,
            'door_mask': door_mask,
            'door_regions': door_rects,
            'edges': edges
        }
    
    def apply_color_to_segment(self, image: Image.Image, mask: np.ndarray, 
                              hex_color: str, blend_mode: str = 'overlay') -> Image.Image:
        """Realistically apply color while preserving lighting and texture"""
        
        img_array = np.array(image)
        rgb_color = tuple(int(hex_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
        
        # Convert to HSV for better color manipulation
        hsv_img = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV).astype(np.float32)
        
        # Extract hue, saturation, value
        h, s, v = cv2.split(hsv_img)
        
        # Convert target color to HSV
        target_hsv = cv2.cvtColor(np.uint8([[[rgb_color[0], rgb_color[1], rgb_color[2]]]]), 
                                  cv2.COLOR_RGB2HSV)[0][0]
        
        # Create overlay
        mask_float = mask.astype(np.float32) / 255.0
        
        # Blend hue significantly
        h = h * (1 - mask_float) + target_hsv[0] * mask_float
        
        # Maintain saturation and lighting from original
        s = np.clip(s * (1 + mask_float * 0.3), 0, 255)
        
        # Preserve brightness variation (shadows/highlights)
        result_hsv = cv2.merge([h, s, v]).astype(np.uint8)
        result_rgb = cv2.cvtColor(result_hsv, cv2.COLOR_HSV2RGB)
        
        # Smooth edges to prevent harsh transitions
        blurred_mask = cv2.GaussianBlur(mask, (15, 15), 0)
        blurred_mask = blurred_mask.astype(np.float32) / 255.0
        
        final = (img_array * (1 - blurred_mask[..., np.newaxis]) + 
                result_rgb * blurred_mask[..., np.newaxis]).astype(np.uint8)
        
        return Image.fromarray(final)
    
    def apply_texture(self, image: Image.Image, mask: np.ndarray, 
                     texture_type: str) -> Image.Image:
        """Apply realistic texture overlays"""
        
        width, height = image.size
        texture_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        
        if texture_type == 'wood_light':
            self._generate_wood_texture(texture_img, 'light')
        elif texture_type == 'wood_dark':
            self._generate_wood_texture(texture_img, 'dark')
        elif texture_type == 'marble':
            self._generate_marble_texture(texture_img)
        elif texture_type == 'concrete':
            self._generate_concrete_texture(texture_img)
        elif texture_type == 'brick':
            self._generate_brick_texture(texture_img)
        elif texture_type == 'wallpaper_subtle':
            self._generate_wallpaper_texture(texture_img)
        elif texture_type == 'glossy':
            self._generate_glossy_effect(texture_img)
        
        # Apply texture only to masked area
        mask_img = Image.fromarray(mask).convert('L')
        texture_img.putalpha(Image.eval(mask_img, lambda x: int(x * 0.15)))
        
        # Composite
        result = Image.new('RGB', image.size, (255, 255, 255))
        result.paste(image, (0, 0))
        result.paste(texture_img, (0, 0), texture_img)
        
        return result
    
    def _generate_wood_texture(self, img: Image.Image, style: str):
        """Generate wood grain texture"""
        width, height = img.size
        pixels = img.load()
        
        base_color = (139, 90, 43) if style == 'dark' else (184, 135, 98)
        
        for y in range(height):
            for x in range(width):
                noise = np.sin(x * 0.02 + y * 0.01) * 20 + np.sin(x * 0.001) * 30
                intensity = int(noise) % 40
                color = tuple(max(0, min(255, c + intensity)) for c in base_color)
                pixels[x, y] = color
    
    def _generate_marble_texture(self, img: Image.Image):
        """Generate marble texture"""
        width, height = img.size
        pixels = img.load()
        
        for y in range(height):
            for x in range(width):
                # Perlin-like noise approximation
                n = int((np.sin(x * 0.01) + np.cos(y * 0.01)) * 50) + 128
                gray = max(150, min(230, n))
                color = (gray, gray, max(200, gray - 20))
                pixels[x, y] = color
    
    def _generate_concrete_texture(self, img: Image.Image):
        """Generate concrete texture"""
        width, height = img.size
        pixels = img.load()
        
        for y in range(height):
            for x in range(width):
                noise = int((np.sin(x * 0.003) + np.cos(y * 0.003)) * 30) + 128
                variation = int(np.random.uniform(-10, 10))
                gray = np.clip(noise + variation, 100, 180)
                color = (gray, gray + 5, gray + 10)
                pixels[x, y] = color
    
    def _generate_brick_texture(self, img: Image.Image):
        """Generate brick texture"""
        width, height = img.size
        draw = ImageDraw.Draw(img)
        
        brick_width, brick_height = 40, 25
        base_color = (204, 85, 68)
        
        for y in range(0, height, brick_height):
            offset = brick_width // 2 if (y // brick_height) % 2 else 0
            for x in range(-offset, width, brick_width):
                x_pos = [x, x + brick_width, x + brick_width, x]
                y_pos = [y, y, y + brick_height, y + brick_height]
                draw.polygon(list(zip(x_pos, y_pos)), fill=base_color, outline=(100, 40, 30))
    
    def _generate_wallpaper_texture(self, img: Image.Image):
        """Generate subtle wallpaper pattern"""
        width, height = img.size
        draw = ImageDraw.Draw(img)
        
        pattern_size = 20
        for y in range(0, height, pattern_size):
            for x in range(0, width, pattern_size):
                if (x + y) % 40 == 0:
                    draw.ellipse([x, y, x + 5, y + 5], fill=(220, 220, 220))
    
    def _generate_glossy_effect(self, img: Image.Image):
        """Add glossy highlights"""
        draw = ImageDraw.Draw(img, 'RGBA')
        width, height = img.size
        
        # Diagonal light reflection
        for i in range(5):
            y_offset = i * 40
            draw.line([(0, y_offset), (width * 0.3, y_offset + 100)], 
                     fill=(255, 255, 255, 30), width=20)
    
    def generate_variations(self, original_image: Image.Image, segments: Dict, 
                           num_colors: int = 5, num_textures: int = 5) -> List[Image.Image]:
        """Generate multiple design variations"""
        
        variations = []
        img_array = np.array(original_image)
        wall_mask = segments['wall_mask']
        door_mask = segments['door_mask']
        
        # Select color palettes
        color_selections = [
            list(self.color_palettes['modern'])[:num_colors],
            list(self.color_palettes['minimal'])[:num_colors],
            list(self.color_palettes['bold'])[:num_colors],
            list(self.color_palettes['neutral'])[:num_colors],
            list(self.color_palettes['warm'])[:num_colors]
        ]
        
        # Generate wall color variations
        for palette in color_selections[:num_colors]:
            for color in palette[:2]:
                result = self.apply_color_to_segment(original_image, wall_mask, color)
                variations.append(result)
        
        # Generate texture variations
        texture_subset = self.texture_types[:num_textures]
        for texture in texture_subset:
            result = self.apply_texture(original_image, wall_mask, texture)
            variations.append(result)
            
            # Also apply color to textured version
            if variations:
                result = self.apply_color_to_segment(result, wall_mask, 
                                                     self.color_palettes['modern'][0])
                variations.append(result)
        
        return variations[:num_colors + num_textures]
    
    def encode_image(self, image: Image.Image) -> str:
        """Encode PIL image to base64"""
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def _normalize_texture(self, texture_type: str) -> str:
        mapping = {
            'wood': 'wood_light',
            'wood_light': 'wood_light',
            'wood_dark': 'wood_dark',
            'marble': 'marble',
            'concrete': 'concrete',
            'brick': 'brick',
            'wallpaper': 'wallpaper_subtle',
            'wallpaper_subtle': 'wallpaper_subtle',
            'glossy': 'glossy',
            'matte': None
        }
        return mapping.get(texture_type, None)

    def process_image(self, image_path: str, selected_color: str = None, texture_type: str = None) -> Dict:
        """Main processing pipeline"""
        
        # Load image
        image = Image.open(image_path).convert('RGB')
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        img_array = np.array(image)
        
        # Detect segments
        segments = self.detect_segments(img_array)

        # Apply selected color and texture if provided
        primary_image = image
        if selected_color:
            primary_image = self.apply_color_to_segment(primary_image, segments['wall_mask'], selected_color)

        normalized_texture = self._normalize_texture(texture_type) if texture_type else None
        if normalized_texture:
            primary_image = self.apply_texture(primary_image, segments['wall_mask'], normalized_texture)
        
        # Generate variations
        variations = self.generate_variations(image, segments, num_colors=5, num_textures=5)
        
        # Encode results
        results = {
            'original': self.encode_image(image),
            'primary': self.encode_image(primary_image),
            'variations': [self.encode_image(v) for v in variations],
            'segments': {
                'walls_detected': True,
                'doors_detected': len(segments['door_regions']) > 0,
                'door_count': len(segments['door_regions'])
            }
        }
        
        return results
