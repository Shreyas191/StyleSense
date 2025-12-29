from fastapi import HTTPException, status, UploadFile
from typing import List, Optional
from models.outfit import OutfitAnalysis, OutfitAnalysisCreate, OutfitAnalysisResponse, Comment

from services.outfit_service import outfit_service
from services.gemini_service import gemini_service
from services.user_service import user_service
from utils.file_utils import validate_file, save_upload_file, get_file_path, delete_file

class OutfitController:
    @staticmethod
    async def get_community_feed(limit: int = 50, skip: int = 0) -> dict:
        """Get the community feed."""
        analyses = await outfit_service.get_community_feed(limit, skip)
        return {
            "success": True,
            "data": analyses
        }

    @staticmethod
    async def toggle_public_status(analysis_id: str, user_email: str, tags: List[str] = None) -> dict:
        """Toggle public status of an analysis."""
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        new_status = await outfit_service.toggle_public(analysis_id, user.id, tags)
        return {
            "success": True,
            "message": "Visibility updated",
            "is_public": new_status
        }

    @staticmethod
    async def toggle_like(analysis_id: str, user_email: str) -> dict:
        """Toggle like on an analysis."""
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        is_liked = await outfit_service.toggle_like(analysis_id, user.id)
        return {
            "success": True,
            "liked": is_liked
        }

    @staticmethod
    async def toggle_dislike(analysis_id: str, user_email: str) -> dict:
        """Toggle dislike on an analysis."""
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        is_disliked = await outfit_service.toggle_dislike(analysis_id, user.id)
        return {
            "success": True,
            "disliked": is_disliked
        }

    @staticmethod
    async def add_comment(analysis_id: str, user_email: str, text: str) -> dict:
        """Add a comment to an analysis."""
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        comment = Comment(
            user_id=user.id,
            username=user.username,
            text=text
        )
        
        await outfit_service.add_comment(analysis_id, comment.model_dump())
        return {
            "success": True,
            "message": "Comment added",
            "data": comment
        }




    @staticmethod
    async def analyze_outfit(file: UploadFile, user_email: str, occasion: Optional[str] = None, weather: Optional[str] = None) -> dict:
        """
        Analyze outfit from uploaded image.
        """
        try:
            # Validate file
            is_valid, error_msg = await validate_file(file)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_msg
                )
            
            # Get user
            user = await user_service.get_user_by_email(user_email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Save uploaded file
            filename = await save_upload_file(file)
            file_path = get_file_path(filename)
            
            try:
                # Analyze outfit using Gemini
                analysis_result = await gemini_service.analyze_outfit(file_path, occasion, weather)
                
                # Save analysis to database
                analysis_data = OutfitAnalysisCreate(
                    user_id=user.id,
                    image_filename=filename,
                    analysis_result=analysis_result
                )
                
                saved_analysis = await outfit_service.create_analysis(analysis_data)
                
                return {
                    "success": True,
                    "message": "Outfit analyzed successfully",
                    "data": saved_analysis
                }
                
            except Exception as e:
                # If analysis fails, delete the uploaded file
                delete_file(filename)
                raise e
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error analyzing outfit: {str(e)}"
            )
    
    @staticmethod
    async def get_analysis(analysis_id: str, user_email: str) -> dict:
        """Get a specific outfit analysis."""
        # Get user
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get analysis
        analysis = await outfit_service.get_analysis_by_id(analysis_id)
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Check if user owns this analysis
        if analysis.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return {
            "success": True,
            "message": "Analysis retrieved successfully",
            "data": analysis
        }
    
    @staticmethod
    async def get_user_analyses(user_email: str, limit: int = 50, skip: int = 0) -> dict:
        """Get all outfit analyses for a user."""
        # Get user
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get analyses
        analyses = await outfit_service.get_user_analyses(user.id, limit, skip)
        total_count = await outfit_service.get_analysis_count(user.id)
        
        return {
            "success": True,
            "message": "Analyses retrieved successfully",
            "data": {
                "analyses": analyses,
                "total": total_count,
                "limit": limit,
                "skip": skip
            }
        }
    
    @staticmethod
    async def delete_analysis(analysis_id: str, user_email: str) -> dict:
        """Delete an outfit analysis."""
        # Get user
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get analysis to get filename
        analysis = await outfit_service.get_analysis_by_id(analysis_id)
        if analysis and analysis.user_id == user.id:
            # Delete file
            delete_file(analysis.image_filename)
        
        # Delete analysis
        deleted = await outfit_service.delete_analysis(analysis_id, user.id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found or access denied"
            )
        
        return {
            "success": True,
            "message": "Analysis deleted successfully"
        }


    @staticmethod
    async def chat_about_outfit(analysis_id: str, user_email: str, message: str, history: List[dict]) -> dict:
        """Chat with AI stylist about specific outfit."""
        # Get user
        user = await user_service.get_user_by_email(user_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get analysis
        analysis = await outfit_service.get_analysis_by_id(analysis_id)
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
            
        # Check ownership
        if analysis.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
            
        # Call Gemini using the serialized analysis result
        response = await gemini_service.chat_with_stylist(
            analysis.analysis_result.model_dump(), 
            history, 
            message
        )
        
        return {
            "success": True,
            "message": response
        }


outfit_controller = OutfitController()
