import os
from google import genai
from app.schemas.ai import TripSuggestionRequest, TripSuggestionResponse
from app.core.config import settings

def get_trip_suggestions(request: TripSuggestionRequest) -> TripSuggestionResponse:
    if not settings.GEMINI_API_KEY:
        return TripSuggestionResponse(suggestions="[Gemini API Key missing in backend/.env]")
        
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # Using gemini-2.5-flash as the default model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.prompt
        )
        return TripSuggestionResponse(suggestions=response.text)
    except Exception as e:
        return TripSuggestionResponse(suggestions=f"[AI Error: {str(e)}]")
