from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from config.database import get_database
from models.outfit import OutfitAnalysis, OutfitAnalysisCreate


class OutfitService:
    @staticmethod
    async def create_analysis(analysis_data: OutfitAnalysisCreate) -> OutfitAnalysis:
        """Save outfit analysis to database."""
        db = await get_database()
        
        # Create analysis document
        analysis_dict = analysis_data.model_dump()
        analysis_dict["created_at"] = datetime.utcnow()
        
        # Insert into database
        result = await db.outfit_analyses.insert_one(analysis_dict)
        analysis_dict["_id"] = str(result.inserted_id)
        
        return OutfitAnalysis(**analysis_dict)
    
    @staticmethod
    async def get_analysis_by_id(analysis_id: str) -> Optional[OutfitAnalysis]:
        """Get outfit analysis by ID."""
        db = await get_database()
        
        try:
            analysis = await db.outfit_analyses.find_one({"_id": ObjectId(analysis_id)})
            if analysis:
                analysis["_id"] = str(analysis["_id"])
                return OutfitAnalysis(**analysis)
        except Exception as e:
            print(f"Error getting analysis: {e}")
            pass
        
        return None
    
    @staticmethod
    async def get_user_analyses(user_id: str, limit: int = 50, skip: int = 0) -> List[OutfitAnalysis]:
        """Get all outfit analyses for a user."""
        db = await get_database()
        
        cursor = db.outfit_analyses.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        
        analyses = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            analyses.append(OutfitAnalysis(**doc))
        
        return analyses
    
    @staticmethod
    async def delete_analysis(analysis_id: str, user_id: str) -> bool:
        """Delete an outfit analysis."""
        db = await get_database()
        
        try:
            result = await db.outfit_analyses.delete_one({
                "_id": ObjectId(analysis_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception:
            return False
    
    @staticmethod
    async def get_analysis_count(user_id: str) -> int:
        """Get total count of analyses for a user."""
        db = await get_database()
        count = await db.outfit_analyses.count_documents({"user_id": user_id})
        return count


outfit_service = OutfitService()
