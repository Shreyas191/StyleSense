import os
import aiofiles
from typing import Tuple
from fastapi import UploadFile, HTTPException
from config.settings import settings
import uuid


async def validate_file(file: UploadFile) -> Tuple[bool, str]:
    """
    Validate uploaded file for size and extension.
    Returns (is_valid, error_message)
    """
    # Check file extension
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in settings.extensions_list:
        return False, f"File type not allowed. Allowed types: {', '.join(settings.extensions_list)}"
    
    # Read file to check size
    content = await file.read()
    file_size = len(content)
    
    # Reset file pointer
    await file.seek(0)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        return False, f"File too large. Maximum size: {max_mb}MB"
    
    return True, ""


async def save_upload_file(file: UploadFile) -> str:
    """
    Save uploaded file to the upload directory.
    Returns the saved filename.
    """
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return unique_filename


def get_file_path(filename: str) -> str:
    """Get full path for a filename."""
    return os.path.join(settings.UPLOAD_DIR, filename)


def delete_file(filename: str) -> bool:
    """Delete a file from uploads directory."""
    try:
        file_path = get_file_path(filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False
