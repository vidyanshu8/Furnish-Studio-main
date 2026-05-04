import math
import random
from PIL import Image, ImageDraw, ImageChops, ImageFilter


def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def create_texture(size, texture_type, base_color):
    width, height = size
    texture = Image.new('RGB', (width, height), base_color)
    draw = ImageDraw.Draw(texture)

    if texture_type == 'wood':
        for y in range(0, height, 30):
            offset = int(10 * math.sin(y / 30.0))
            draw.line([(0, y + offset), (width, y + offset)], fill=(90, 55, 20), width=10)

    elif texture_type == 'marble':
        for i in range(10):
            x0 = random.randint(0, width)
            y0 = random.randint(0, height)
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            draw.line([(x0, y0), (x1, y1)], fill=(255, 255, 255), width=4)
        texture = texture.filter(ImageFilter.GaussianBlur(2))

    elif texture_type == 'concrete':
        for i in range(0, width, 8):
            for j in range(0, height, 8):
                shade = random.randint(-12, 12)
                r = max(0, min(255, base_color[0] + shade))
                g = max(0, min(255, base_color[1] + shade))
                b = max(0, min(255, base_color[2] + shade))
                draw.rectangle([i, j, i + 8, j + 8], fill=(r, g, b))
        texture = texture.filter(ImageFilter.GaussianBlur(1))

    elif texture_type == 'wallpaper':
        for y in range(0, height, 40):
            for x in range(0, width, 40):
                radius = 6
                draw.ellipse([x + 12, y + 12, x + 12 + radius, y + 12 + radius], fill=(255, 255, 255))

    return texture


def apply_style(original_image, mask_image, color_hex, texture_type):
    size = original_image.size
    base_color = hex_to_rgb(color_hex)
    overlay = Image.new('RGB', size, base_color)

    if texture_type and texture_type != 'matte':
        texture = create_texture(size, texture_type, base_color)
        overlay = ImageChops.multiply(overlay, texture)

    blended = ImageChops.multiply(original_image, overlay)
    blended = Image.blend(original_image, blended, 0.55)
    mask = mask_image.resize(size, Image.LANCZOS).convert('L')
    result = Image.composite(blended, original_image, mask)
    return result
