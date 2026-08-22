from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai import TripSuggestionRequest, TripSuggestionResponse
from app.ai import gemini_service

router = APIRouter()

@router.post("/trip-suggestions", response_model=TripSuggestionResponse)
def suggest_trip(
    request: TripSuggestionRequest,
    current_user: User = Depends(get_current_user)
):
    return gemini_service.get_trip_suggestions(request)
