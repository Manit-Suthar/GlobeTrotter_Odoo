import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.ai import (
    TripIntentRequest,
    TripIntentResponse,
    TripSuggestionRequest,
    TripSuggestionResponse,
)

logger = logging.getLogger(__name__)

# --- PHASE 1: Intent Extraction ---
# For a full explanation of this architecture, see docs/ai_workflow.md
SYSTEM_PROMPT = """You are an AI travel planning assistant. Your job is to extract a structured travel intent object from a user's trip details.

IMPORTANT NOTE: The dataset only has data about places inside India. You must assume all destinations and travel planning are strictly within India unless impossible.

Analyze the user's trip input (title, dates, description). Follow these specific rules:
- title: If the user provided a title, use it. If not, generate a catchy, short title based on their description (e.g., "Serene Kerala Retreat").
- trip_duration_days: If exact dates aren't provided, look for duration clues in the description (like "4 days" or "a week") and output an integer.
- estimated_budget_range: Infer a structured budget range based on their text (e.g., "$1000-$1500" or "Mid-range ($100-$200/day)").
- suggested_timeline: Provide a high-level array of strings outlining a rough progression of the trip (e.g., ["Day 1-2: Arrival & City Tour", "Day 3: Hiking", "Day 4: Departure"]).
- travel_interests: List of interest tags (e.g., ["history", "food", "adventure"]).
- preferred_travel_style: Travel style if implied (e.g., "budget", "luxury", "solo", "family").
- pace: Preferred pace ("slow", "moderate", "fast-paced").
- budget_preference: Raw budget details mentioned by the user.
- destinations: List of cities, regions, or countries mentioned.
- additional_constraints: Explicit constraints (e.g., "vegetarian", "wheelchair accessible").
- summary: A 1-2 sentence summary of the travel intent.

You MUST respond strictly with a valid JSON object matching this structure:
{
  "title": "...",
  "trip_duration_days": 4,
  "travel_interests": ["tag1", "tag2"],
  "preferred_travel_style": "...",
  "pace": "...",
  "budget_preference": "...",
  "estimated_budget_range": "...",
  "suggested_timeline": ["...", "..."],
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
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        user_content = f"""Trip Title: {request.title}
Start Date: {request.start_date or 'Not provided'}
End Date: {request.end_date or 'Not provided'}
Description / Notes: {request.description or 'Not provided'}"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2
            )
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
            title=parsed_data.get("title") or request.title or "Untitled Trip",
            start_date=request.start_date,
            end_date=request.end_date,
            trip_duration_days=calculated_duration or parsed_data.get("trip_duration_days"),
            travel_interests=parsed_data.get("travel_interests") or [],
            preferred_travel_style=parsed_data.get("preferred_travel_style"),
            pace=parsed_data.get("pace"),
            budget_preference=parsed_data.get("budget_preference"),
            estimated_budget_range=parsed_data.get("estimated_budget_range"),
            suggested_timeline=parsed_data.get("suggested_timeline") or [],
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
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=request.prompt
        )
        return TripSuggestionResponse(suggestions=response.text or "No suggestions generated.")
    except Exception as exc:
        return TripSuggestionResponse(suggestions=f"Error generating suggestions: {str(exc)}")


from sqlalchemy.orm import Session
from app.models.city import City
from app.models.activity import Activity
from app.models.hotel import Hotel
from app.schemas.ai import GenerateItineraryRequest, GenerateItineraryResponse

# --- PHASE 2: Database-Contextualized Itinerary Generation ---
# See docs/ai_workflow.md for how we inject PostgreSQL data into Gemini
ITINERARY_SYSTEM_PROMPT = """You are an AI travel itinerary planner specializing in Indian travel. Your goal is to generate a detailed, structured, daily travel itinerary using exact data from our database.

You will be given:
1. The user's travel intent (destinations, pace, interests, budget).
2. A JSON dump of matching cities and activities available in our database.

You MUST follow these rules strictly:
- Schedule a realistic daily itinerary matching the user's intent.
- You must create stops for the cities. Use the EXACT city_id (UUID) provided in the database dump.
- Schedule ctivities for each stop. If you use a database activity, use its EXACT ctivity_id (UUID) and cost_estimate.
- If the database lacks a specific activity or hotel, you can invent a custom one by setting ctivity_id to null and providing a custom_name.
- You must assign sequential order_index (starting at 0) to stops.
- Format times as ISO-8601 strings (e.g. 2026-10-01T09:00:00Z) if start_date is known, otherwise pick arbitrary sequential dates starting today.

You MUST respond strictly with a valid JSON object matching this structure:
{
  "stops": [
    {
      "city_id": "uuid-of-city",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "order_index": 0,
      "activities": [
        {
          "activity_id": "uuid-of-activity-or-null",
          "custom_name": "Name of activity",
          "scheduled_time": "YYYY-MM-DDTHH:MM:SSZ",
          "cost_estimate": 150.0,
          "notes": "Short description of why it fits."
        }
      ]
    }
  ]
}
Do not include markdown code block formatting. Output ONLY valid raw JSON.
"""

def generate_itinerary_from_db(request: GenerateItineraryRequest, db: Session) -> GenerateItineraryResponse:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured."
        )
        
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # 1. Look up cities mentioned in destinations
    cities_data = []
    activities_data = []
    
    if request.destinations:
        from sqlalchemy import or_
        conditions = [City.name.ilike(f"%{dest}%") for dest in request.destinations]
        cities = db.query(City).filter(or_(*conditions)).limit(10).all()
        
        # Fallback if no exact cities matched
        if not cities:
            cities = db.query(City).order_by(City.popularity.desc()).limit(5).all()
            
        for city in cities:
            cities_data.append({
                "city_id": str(city.id),
                "name": city.name,
                "state": city.state
            })
            
            city_activities = db.query(Activity).filter(Activity.city_id == city.id).limit(10).all()
            for act in city_activities:
                activities_data.append({
                    "activity_id": str(act.id),
                    "city_name": city.name,
                    "name": act.name,
                    "category": act.category,
                    "default_cost": act.default_cost,
                    "duration_minutes": act.default_duration_minutes
                })
                
    db_context_json = json.dumps({
        "available_cities": cities_data,
        "available_activities": activities_data
    })
    
    user_context = f"Intent: {request.model_dump_json()}\n\nDatabase Context: {db_context_json}"
    
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=user_context,
        config=types.GenerateContentConfig(
            system_instruction=ITINERARY_SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    
    raw_json = response.text.strip()
    if raw_json.startswith("`"):
        raw_json = raw_json.strip("").removeprefix("json").strip()
        
    parsed_data = json.loads(raw_json)
    
    return GenerateItineraryResponse(**parsed_data)

