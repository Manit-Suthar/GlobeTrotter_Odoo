from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai import (
    TripIntentRequest,
    TripIntentResponse,
    TripSuggestionRequest,
    TripSuggestionResponse,
)
from app.ai import gemini_service

router = APIRouter()

@router.post("/intent", response_model=TripIntentResponse)
def parse_trip_intent(
    request: TripIntentRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Extract structured travel-planning intent from trip form inputs using Gemini API.
    """
    return gemini_service.parse_trip_intent(request)

@router.post("/trip-suggestions", response_model=TripSuggestionResponse)
def suggest_trip(
    request: TripSuggestionRequest,
    current_user: User = Depends(get_current_user)
):
    return gemini_service.get_trip_suggestions(request)

