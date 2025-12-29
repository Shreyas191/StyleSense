from fastapi import APIRouter, Depends, File, UploadFile, Query, Form, Body
from typing import Optional, List
from models.user import TokenData
from models.outfit import ChatRequest
from auth.jwt_handler import get_current_user
from controllers.outfit_controller import outfit_controller

router = APIRouter(prefix="/api/outfit", tags=["Outfit Analysis"])


@router.get("/community/feed")
async def get_community_feed(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    """Get the community feed (public outfits)."""
    return await outfit_controller.get_community_feed(limit, skip)


@router.post("/{analysis_id}/toggle-public")
async def toggle_public_status(
    analysis_id: str,
    tags: List[str] = Body(None),
    current_user: TokenData = Depends(get_current_user)
):
    """Toggle public visibility of an outfit."""
    return await outfit_controller.toggle_public_status(analysis_id, current_user.email, tags)


@router.post("/{analysis_id}/like")
async def toggle_like(
    analysis_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Toggle like on an outfit."""
    return await outfit_controller.toggle_like(analysis_id, current_user.email)

@router.post("/{analysis_id}/dislike")
async def toggle_dislike(
    analysis_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Toggle dislike on an outfit."""
    return await outfit_controller.toggle_dislike(analysis_id, current_user.email)


@router.post("/{analysis_id}/comment")
async def add_comment(
    analysis_id: str,
    comment: dict = Body(...),
    current_user: TokenData = Depends(get_current_user)
):
    """Add a comment to an outfit."""
    return await outfit_controller.add_comment(analysis_id, current_user.email, comment.get("text", ""))


@router.post("/analyze")
async def analyze_outfit(
    file: UploadFile = File(...),
    occasion: Optional[str] = Form(None),
    weather: Optional[str] = Form(None),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload an outfit image and get AI analysis.
    
    - **file**: Image file (JPG, JPEG, PNG, max 5MB)
    
    Returns:
    - Detected clothing items
    - Style description
    - Outfit rating (1-10)
    - Improvement suggestions
    - Cheaper alternatives
    - Color matching recommendations
    """
    return await outfit_controller.analyze_outfit(file, current_user.email, occasion, weather)


@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a specific outfit analysis by ID.
    
    - **analysis_id**: MongoDB ObjectId of the analysis
    """
    return await outfit_controller.get_analysis(analysis_id, current_user.email)


@router.get("/user/all")
async def get_user_analyses(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get all outfit analyses for the authenticated user.
    
    - **limit**: Maximum number of results (1-100)
    - **skip**: Number of results to skip (for pagination)
    """
    return await outfit_controller.get_user_analyses(current_user.email, limit, skip)


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Delete an outfit analysis.
    
    - **analysis_id**: MongoDB ObjectId of the analysis to delete
    """
    return await outfit_controller.delete_analysis(analysis_id, current_user.email)


@router.post("/chat/{analysis_id}")
async def chat_about_outfit(
    analysis_id: str,
    chat_request: ChatRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Chat with the AI stylist about a specific outfit.
    """
    return await outfit_controller.chat_about_outfit(
        analysis_id, 
        current_user.email,
        chat_request.message,
        [m.model_dump() for m in chat_request.history]
    )
