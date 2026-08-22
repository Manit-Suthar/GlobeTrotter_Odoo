import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
import google.generativeai as genai

from app.core.config import settings
from app.schemas.ai import (
    TripIntentRequest,
    TripIntentResponse,
    TripSuggestionRequest,
    TripSuggestionResponse,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an AI travel planning assistant. Your job is to extract a structured travel intent object from a user's trip details.

Analyze the user's trip input (title, dates, description) and extract the following:
- travel_interests: List of interest tags (e.g., ["history", "food", "adventure", "nature", "architecture"])
- preferred_travel_style: Travel style if implied or stated (e.g., "budget", "luxury", "backpacker", "solo", "family", "relaxed")
- pace: Preferred pace of travel ("slow", "moderate", "fast-paced")
- budget_preference: Budget details or preference if mentioned (e.g., "budget", "mid-range", "luxury", or explicit amounts like "INR 50,000")
- destinations: List of cities, states, regions, or countries explicitly or implicitly mentioned in the input
- additional_constraints: Any explicit user requirements or constraints (e.g., "vegetarian food", "pet friendly", "wheelchair accessible", "family with kids")
- summary: A clear 1-2 sentence summary of the user's travel intent.

You MUST respond strictly with a valid JSON object matching this structure:
{
  "travel_interests": ["tag1", "tag2"],
  "preferred_travel_style": "...",
  "pace": "...",
  "budget_preference": "...",
  "destinations": ["destination1", "destination2"],
  "additional_constraints": ["constraint1"],
  "summary": "..."
}
Do not include markdown code block formatting (like ```json), commentary, or extra text. Output ONLY valid raw JSON.
"""

def _calculate_duration(start_date: Optional[str], end_date: Optional[str]) -> Optional[int]:
    if not start_date or not end_date:
        return None
    try:
        start = datetime.strptime(start_date.strip(), "%Y-%m-%d")
        end = datetime.strptime(end_date.strip(), "%Y-%m-%d")
        delta = (end - start).days + 1
        return delta if delta > 0 else None
    except ValueError:
        return None

def parse_trip_intent(request: TripIntentRequest) -> TripIntentResponse:
    """
    Parses trip form inputs (title, start_date, end_date, description) into a structured 
    travel planning intent object via Gemini API.
    """
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not configured in settings")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables."
        )

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-3.6-flash",
            system_instruction=SYSTEM_PROMPT
        )

        user_content = f"""Trip Title: {request.title}
Start Date: {request.start_date or 'Not provided'}
End Date: {request.end_date or 'Not provided'}
Description / Notes: {request.description or 'Not provided'}"""

        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.2
        )

        response = model.generate_content(
            contents=user_content,
            generation_config=generation_config
        )

        if not response or not response.text:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Empty response received from Gemini API."
            )

        raw_json = response.text.strip()
        # Clean potential markdown wrapping if returned
        if raw_json.startswith("```"):
            raw_json = raw_json.strip("`").removeprefix("json").strip()

        parsed_data = json.loads(raw_json)

        calculated_duration = _calculate_duration(request.start_date, request.end_date)

        intent_response = TripIntentResponse(
            title=request.title,
            start_date=request.start_date,
            end_date=request.end_date,
            trip_duration_days=calculated_duration or parsed_data.get("trip_duration_days"),
            travel_interests=parsed_data.get("travel_interests") or [],
            preferred_travel_style=parsed_data.get("preferred_travel_style"),
            pace=parsed_data.get("pace"),
            budget_preference=parsed_data.get("budget_preference"),
            destinations=parsed_data.get("destinations") or [],
            additional_constraints=parsed_data.get("additional_constraints") or [],
            summary=parsed_data.get("summary")
        )

        return intent_response

    except HTTPException:
        raise
    except json.JSONDecodeError as exc:
        logger.error(f"Failed to parse Gemini output as JSON: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Malformed model output from Gemini: {str(exc)}"
        )
    except Exception as exc:
        logger.error(f"Gemini API error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API execution failed: {str(exc)}"
        )

def get_trip_suggestions(request: TripSuggestionRequest) -> TripSuggestionResponse:
    """
    Backwards-compatible suggestion endpoint wrapper.
    """
    if not settings.GEMINI_API_KEY:
        return TripSuggestionResponse(
            suggestions=f"AI suggestions for: {request.prompt} (Stub - GEMINI_API_KEY not configured)"
        )
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(model_name="gemini-3.6-flash")
        response = model.generate_content(request.prompt)
        return TripSuggestionResponse(suggestions=response.text or "No suggestions generated.")
    except Exception as exc:
        return TripSuggestionResponse(suggestions=f"Error generating suggestions: {str(exc)}")

