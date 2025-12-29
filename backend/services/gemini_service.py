import google.generativeai as genai
from PIL import Image
import json
from typing import Dict, Any
from config.settings import settings
from models.outfit import AnalysisResult

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    async def analyze_outfit(self, image_path: str, occasion: str = None, weather: str = None) -> AnalysisResult:
        """
        Analyze outfit image using Gemini Vision API.
        
        Args:
            image_path: Path to the outfit image
            occasion: Optional event/occasion the outfit is for
            weather: Optional weather context (e.g., "20°C, Rainy")
            
        Returns:
            AnalysisResult object with complete analysis
        """
        try:
            # Open and prepare image
            img = Image.open(image_path)
            
            occasion_context = ""
            if occasion:
                occasion_context = f"The user intends to wear this outfit for: {occasion}. Please specifically evaluate its suitability for this occasion in your style description, rating, and suggestions."

            weather_context = ""
            print(f"DEBUG: Analyzing with weather: {weather}")
            if weather:
                weather_context = f"The user's local weather is: {weather}. Please specifically warn the user if the outfit is not practical for this weather (e.g. wearing sandals in rain, or heavy coat in heat) and suggest alternatives."

            # Create detailed prompt for Gemini
            prompt = """Analyze the outfit in this image carefully and provide a comprehensive fashion analysis. """ + occasion_context + " " + weather_context + """
            
Return ONLY a valid JSON object (no markdown, no code blocks, no additional text) with this exact structure:

{
  "detected_outfit_items": [
    {
      "name": "item name",
      "category": "category (e.g., top, bottom, shoes, accessory, outerwear)",
      "color": "primary color",
      "description": "brief description"
    }
  ],
  "style_description": "overall style description (2-3 sentences)",
  "compliment": "A short, encouraging, 1-sentence verbal compliment or genuine feedback designed to be spoken aloud",
  "outfit_rating": {
    "score": 7.5,
    "reason": "detailed reason for the score"
  },
  "improvement_suggestions": [
    "specific suggestion 1",
    "specific suggestion 2",
    "specific suggestion 3"
  ],
  "cheaper_alternatives": [
    {
      "item": "expensive item name",
      "suggestion": "cheaper alternative suggestion",
      "estimated_price_range": "$XX-$XX"
    }
  ],
  "color_matching_recommendations": [
    "color pairing suggestion 1",
    "color pairing suggestion 2",
    "color pairing suggestion 3"
  ],
  "weather_suitability": {
    "is_suitable": true, 
    "reason": "Create this ONLY if weather context is provided. Evaluate if outfit works for the weather.",
    "advice": "Advice if not suitable or tips for the weather."
  }
}

Be specific, professional, and helpful. The rating should be between 1-10. If weather context is not provided, you MUST set weather_suitability to null."""

            # Generate response
            response = self.model.generate_content([prompt, img])
            
            # Parse JSON response
            response_text = response.text.strip()
            print(f"DEBUG: Gemini raw response: {response_text}")
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            analysis_data = json.loads(response_text)
            
            # Validate and create AnalysisResult
            analysis_result = AnalysisResult(**analysis_data)
            
            return analysis_result
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a default response
            print(f"JSON parsing error: {e}")
            print(f"Response text: {response_text}")
            return self._create_default_analysis()
        except Exception as e:
            print(f"Error analyzing outfit: {e}")
            raise Exception(f"Failed to analyze outfit: {str(e)}")
    
    def _create_default_analysis(self) -> AnalysisResult:
        """Create a default analysis response when API fails."""
        return AnalysisResult(
            detected_outfit_items=[
                {
                    "name": "Unable to detect",
                    "category": "unknown",
                    "color": "unknown",
                    "description": "Analysis failed"
                }
            ],
            style_description="Unable to analyze the outfit at this time. Please try again.",
            compliment="We couldn't fully analyze the details, but thanks for uploading!",
            outfit_rating={
                "score": 5.0,
                "reason": "Analysis could not be completed"
            },
            improvement_suggestions=[
                "Please upload a clear, well-lit photo of the outfit",
                "Ensure the entire outfit is visible in the image"
            ],
            cheaper_alternatives=[],
            color_matching_recommendations=[
                "Upload a new image for color recommendations"
            ]
        )


    async def chat_with_stylist(self, analysis_context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        """
        Chat with AI stylist about specific outfit analysis.
        """
        try:
            # Construct context string from analysis result
            context_str = f"""
            Context - Outfit Analysis:
            Style: {analysis_context.get('style_description', 'N/A')}
            Items: {', '.join([item.get('name', 'item') for item in analysis_context.get('detected_outfit_items', [])])}
            Rating: {analysis_context.get('outfit_rating', {}).get('score', 'N/A')}/10
            """

            # Format history
            history_str = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in chat_history])

            prompt = f"""You are a professional, helpful, and friendly AI fashion stylist. 
            You are discussing a specific outfit with a user. Use the analysis context below to answer their questions.
            
            {context_str}
            
            Previous Conversation:
            {history_str}
            
            User: {user_message}
            AI Stylist:"""

            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error in chat: {e}")
            return f"Error: {str(e)}"


# Create singleton instance
gemini_service = GeminiService()
