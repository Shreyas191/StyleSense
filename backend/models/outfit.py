from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ClothingItem(BaseModel):
    name: str
    category: str
    color: str
    description: Optional[str] = None


class OutfitRating(BaseModel):
    score: float
    reason: str


class CheaperAlternative(BaseModel):
    item: str
    suggestion: str
    estimated_price_range: str


class AnalysisResult(BaseModel):
    detected_outfit_items: List[ClothingItem]
    style_description: str
    compliment: Optional[str] = None
    outfit_rating: OutfitRating
    improvement_suggestions: List[str]
    cheaper_alternatives: List[CheaperAlternative]
    color_matching_recommendations: List[str]


class OutfitAnalysisBase(BaseModel):
    image_filename: str
    analysis_result: AnalysisResult


class OutfitAnalysisCreate(OutfitAnalysisBase):
    user_id: str


class OutfitAnalysis(OutfitAnalysisBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "image_filename": "outfit_123.jpg",
                "analysis_result": {
                    "detected_outfit_items": [
                        {
                            "name": "Blue Denim Jacket",
                            "category": "Outerwear",
                            "color": "Blue",
                            "description": "Classic denim jacket"
                        }
                    ],
                    "style_description": "Casual street style",
                    "outfit_rating": {
                        "score": 8.5,
                        "reason": "Well-coordinated casual look"
                    },
                    "improvement_suggestions": ["Add a belt"],
                    "cheaper_alternatives": [],
                    "color_matching_recommendations": ["White sneakers"]
                },
                "created_at": "2024-01-01T00:00:00"
            }
        }


class OutfitAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[OutfitAnalysis] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
