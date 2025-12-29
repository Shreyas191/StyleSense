from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime

# Define PyObjectId helper to handle MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class ClosetItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., description="Category of the item (e.g., top, bottom, shoes)")
    color: str = Field(..., description="Primary color of the item")
    image_url: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []

class ClosetItemCreate(ClosetItemBase):
    pass

class ClosetItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

class ClosetItem(ClosetItemBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
