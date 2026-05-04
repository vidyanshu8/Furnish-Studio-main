import base64
import io
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from services.segmentation import detect_surface_mask

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post('/upload')
async def upload_image(image: UploadFile = File(...)):
    if image.content_type not in ('image/jpeg', 'image/png'):
        raise HTTPException(status_code=415, detail='Only JPG and PNG are supported')

    content = await image.read()
    try:
        original_image = Image.open(io.BytesIO(content)).convert('RGB')
    except Exception:
        raise HTTPException(status_code=400, detail='Unable to decode image file')

    filename = f'{uuid.uuid4().hex}.png'
    image_path = os.path.join(UPLOAD_DIR, filename)
    original_image.save(image_path, format='PNG')

    mask_image, detected = detect_surface_mask(image_path)
    mask_buffer = io.BytesIO()
    mask_image.save(mask_buffer, format='PNG')

    return JSONResponse({
        'image': f'data:{image.content_type};base64,{base64.b64encode(content).decode()}',
        'mask': f'data:image/png;base64,{base64.b64encode(mask_buffer.getvalue()).decode()}',
        'surfaceDetected': detected,
        'filename': filename
    })
