from typing import Optional
from datetime import datetime
from bson import ObjectId
from config.database import get_database
from models.user import UserCreate, UserInDB
from auth.jwt_handler import get_password_hash


class UserService:
    @staticmethod
    async def create_user(user_data: UserCreate) -> UserInDB:
        """Create a new user in the database."""
        db = await get_database()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Check if username is taken
        existing_username = await db.users.find_one({"username": user_data.username})
        if existing_username:
            raise ValueError("Username already taken")
        
        # Create user document
        user_dict = {
            "email": user_data.email,
            "username": user_data.username,
            "hashed_password": get_password_hash(user_data.password),
            "created_at": datetime.utcnow()
        }
        
        # Insert into database
        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)
        
        return UserInDB(**user_dict)
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[UserInDB]:
        """Get user by email."""
        db = await get_database()
        user = await db.users.find_one({"email": email})
        
        if user:
            user["_id"] = str(user["_id"])
            return UserInDB(**user)
        return None
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
        """Get user by ID."""
        db = await get_database()
        
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
                return UserInDB(**user)
        except Exception:
            pass
        
        return None


user_service = UserService()
