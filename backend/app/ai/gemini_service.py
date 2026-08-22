from app.schemas.ai import TripSuggestionRequest, TripSuggestionResponse

def get_trip_suggestions(request: TripSuggestionRequest) -> TripSuggestionResponse:
    # TODO(Kalp): Integrate with Google Gemini API here.
    # Read GEMINI_API_KEY from app.core.config.settings
    # Return structured AI response
    return TripSuggestionResponse(
        suggestions=f"AI suggestions for: {request.prompt} (Stub - Pending Gemini Integration)"
    )
