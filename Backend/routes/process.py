import base64
import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from services.texture_apply import apply_style

router = APIRouter()

@router.post('/process')
async def process_image(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    color: str = Form(...),
    texture: str = Form(...)
):
    if image.content_type not in ('image/jpeg', 'image/png'):
        raise HTTPException(status_code=415, detail='Only JPG and PNG are supported')

    image_bytes = await image.read()
    mask_bytes = await mask.read()

    try:
        original_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        mask_image = Image.open(io.BytesIO(mask_bytes)).convert('L')
    except Exception:
        raise HTTPException(status_code=400, detail='Unable to decode uploaded files')

    processed_image = apply_style(original_image, mask_image, color, texture)
    output_buffer = io.BytesIO()
    processed_image.save(output_buffer, format='PNG')

    return JSONResponse({
        'image': f'data:image/png;base64,{base64.b64encode(output_buffer.getvalue()).decode()}'
    })
