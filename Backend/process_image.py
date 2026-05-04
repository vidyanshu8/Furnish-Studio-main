#!/usr/bin/env python3
"""
Image processing wrapper for interior design system
Processes images and generates design variations
"""

import sys
import json
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from image_processor import InteriorDesignProcessor
except ImportError:
    print(json.dumps({'error': 'Failed to import image_processor module'}), file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Usage: python process_image.py <image_path> <output_dir> [color] [texture]'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    output_dir = sys.argv[2]
    selected_color = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
    texture_type = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else None
    
    # Validate input
    if not os.path.exists(image_path):
        print(json.dumps({'error': f'Image file not found: {image_path}'}))
        sys.exit(1)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    design_id = Path(image_path).stem
    design_output = os.path.join(output_dir, design_id)
    os.makedirs(design_output, exist_ok=True)
    
    try:
        # Process image
        processor = InteriorDesignProcessor()
        results = processor.process_image(image_path, selected_color, texture_type)
        
        # Save original
        from PIL import Image
        original_img = Image.open(image_path)
        original_img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        original_path = os.path.join(design_output, 'original.png')
        original_img.save(original_path)
        
        # Save variations
        variation_paths = []
        if 'variations' in results:
            for i, var_data in enumerate(results['variations']):
                import base64
                img_data = base64.b64decode(var_data)
                var_path = os.path.join(design_output, f'variation_{i}.png')
                with open(var_path, 'wb') as f:
                    f.write(img_data)
                variation_paths.append(f'variation_{i}.png')
        
        # Prepare response
        response = {
            'success': True,
            'designId': design_id,
            'original': results.get('original'),
            'primary': results.get('primary'),
            'variations': results.get('variations', []),
            'segments': results.get('segments', {}),
            'outputDir': design_output
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': str(e),
            'type': type(e).__name__
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == '__main__':
    main()
