from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from models.closet import ClosetItem, ClosetItemCreate, ClosetItemUpdate
from config.database import get_database

class ClosetService:
    @staticmethod
    async def create_item(user_id: str, item_data: ClosetItemCreate) -> ClosetItem:
        db = await get_database()
        
        new_item = item_data.model_dump()
        new_item["user_id"] = user_id
        new_item["created_at"] = datetime.utcnow()
        new_item["updated_at"] = datetime.utcnow()
        
        result = await db.closet.insert_one(new_item)
        new_item["_id"] = result.inserted_id
        
        return ClosetItem(**new_item)

    @staticmethod
    async def get_user_closet(user_id: str) -> List[ClosetItem]:
        db = await get_database()
        cursor = db.closet.find({"user_id": user_id}).sort("created_at", -1)
        items = await cursor.to_list(length=1000)
        return [ClosetItem(**item) for item in items]

    @staticmethod
    async def get_item(item_id: str, user_id: str) -> Optional[ClosetItem]:
        db = await get_database()
        item = await db.closet.find_one({"_id": ObjectId(item_id), "user_id": user_id})
        if item:
            return ClosetItem(**item)
        return None

    @staticmethod
    async def update_item(item_id: str, user_id: str, update_data: ClosetItemUpdate) -> Optional[ClosetItem]:
        db = await get_database()
        
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        if not update_dict:
            return await ClosetService.get_item(item_id, user_id)
            
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await db.closet.update_one(
            {"_id": ObjectId(item_id), "user_id": user_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            return await ClosetService.get_item(item_id, user_id)
        return None

    @staticmethod
    async def delete_item(item_id: str, user_id: str) -> bool:
        db = await get_database()
        result = await db.closet.delete_one({"_id": ObjectId(item_id), "user_id": user_id})
        return result.deleted_count > 0
