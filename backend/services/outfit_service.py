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
    
    async def get_user_analyses(self, user_id: str, limit: int = 50, skip: int = 0) -> List[OutfitAnalysis]:
        """Get all outfit analyses for a user."""
        try:
            db = await get_database()
            analyses = await db.outfit_analyses.find({"user_id": user_id})\
                .sort("created_at", -1)\
                .skip(skip)\
                .limit(limit)\
                .to_list(length=limit)
            
            # Convert ObjectId to string
            for doc in analyses:
                doc["_id"] = str(doc["_id"])
                
            return [OutfitAnalysis(**analysis) for analysis in analyses]
        except Exception as e:
            print(f"Error fetching analyses: {e}")
            return []

    async def get_community_feed(self, limit: int = 50, skip: int = 0) -> List[OutfitAnalysis]:
        """Get all public outfit analyses."""
        try:
            db = await get_database()
            analyses = await db.outfit_analyses.find({"is_public": True})\
                .sort("created_at", -1)\
                .skip(skip)\
                .limit(limit)\
                .to_list(length=limit)
                
            for doc in analyses:
                doc["_id"] = str(doc["_id"])
                
            return [OutfitAnalysis(**analysis) for analysis in analyses]
        except Exception as e:
            print(f"Error fetching community feed: {e}")
            return []

    async def toggle_public(self, analysis_id: str, user_id: str, tags: List[str] = None) -> bool:
        """Toggle the public visibility of an analysis."""
        try:
            db = await get_database()
            # First check if the user owns it
            analysis = await db.outfit_analyses.find_one({"_id": ObjectId(analysis_id), "user_id": user_id})
            if not analysis:
                return False
            
            new_status = not analysis.get("is_public", False)
            
            update_data = {"is_public": new_status}
            if tags is not None and new_status: # Update tags only when making public
                 update_data["tags"] = tags

            await db.outfit_analyses.update_one(
                {"_id": ObjectId(analysis_id)},
                {"$set": update_data}
            )
            return new_status
        except Exception as e:
            print(f"Error toggling public status: {e}")
            raise e

    async def toggle_like(self, analysis_id: str, user_id: str) -> bool:
        """Toggle like on an analysis."""
        try:
            db = await get_database()
            analysis = await db.outfit_analyses.find_one({"_id": ObjectId(analysis_id)})
            if not analysis:
                return False
            
            likes = analysis.get("likes", [])
            dislikes = analysis.get("dislikes", [])
            
            if user_id in likes:
                # Unlike
                await db.outfit_analyses.update_one(
                    {"_id": ObjectId(analysis_id)},
                    {"$pull": {"likes": user_id}}
                )
                return False
            else:
                # Like (and remove dislike if exists)
                update_query = {"$addToSet": {"likes": user_id}}
                if user_id in dislikes:
                    update_query["$pull"] = {"dislikes": user_id}
                
                await db.outfit_analyses.update_one(
                    {"_id": ObjectId(analysis_id)},
                    update_query
                )
                return True
        except Exception as e:
            print(f"Error toggling like: {e}")
            raise e

    async def toggle_dislike(self, analysis_id: str, user_id: str) -> bool:
        """Toggle dislike on an analysis."""
        try:
            db = await get_database()
            analysis = await db.outfit_analyses.find_one({"_id": ObjectId(analysis_id)})
            if not analysis:
                return False
            
            likes = analysis.get("likes", [])
            dislikes = analysis.get("dislikes", [])
            
            if user_id in dislikes:
                # Undislike
                await db.outfit_analyses.update_one(
                    {"_id": ObjectId(analysis_id)},
                    {"$pull": {"dislikes": user_id}}
                )
                return False
            else:
                # Dislike (and remove like if exists)
                update_query = {"$addToSet": {"dislikes": user_id}}
                if user_id in likes:
                    update_query["$pull"] = {"likes": user_id}
                
                await db.outfit_analyses.update_one(
                    {"_id": ObjectId(analysis_id)},
                    update_query
                )
                return True
        except Exception as e:
            print(f"Error toggling dislike: {e}")
            raise e
            
    async def add_comment(self, analysis_id: str, comment_data: dict) -> bool:
        """Add a comment to an analysis."""
        try:
            db = await get_database()
            await db.outfit_analyses.update_one(
                {"_id": ObjectId(analysis_id)},
                {"$push": {"comments": comment_data}}
            )
            return True
        except Exception as e:
            print(f"Error adding comment: {e}")
            raise e
    
    async def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """Delete an outfit analysis."""
        try:
            db = await get_database()
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
