import json
import logging
import time
import uuid
from datetime import date, datetime, timedelta
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

GENERATE_ATTEMPTS = 3


def _generate_with_retry(client, *, contents: str, config, label: str):
    """Call Gemini, retrying transient transport failures.

    The API occasionally drops the connection mid-request ("Server disconnected without
    sending a response"); a plain retry succeeds, so don't fail a trip over it.
    """
    last_error: Optional[Exception] = None

    for attempt in range(1, GENERATE_ATTEMPTS + 1):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=contents,
                config=config,
            )
            if response and response.text:
                return response
            last_error = ValueError("Empty response from Gemini")
        except Exception as exc:
            last_error = exc
            logger.warning(f"Gemini {label} attempt {attempt}/{GENERATE_ATTEMPTS} failed: {exc}")

        if attempt < GENERATE_ATTEMPTS:
            time.sleep(1.5 * attempt)

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"Gemini API execution failed after {GENERATE_ATTEMPTS} attempts: {last_error}"
    )


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

        response = _generate_with_retry(
            client,
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2
            ),
            label="intent",
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
2. A JSON dump of matching cities, activities, and hotels available in our database.

You MUST follow these rules strictly:
- Schedule a realistic daily itinerary matching the user's intent.
- You must create stops for the cities. Use the EXACT city_id (UUID) provided in the database dump.
- Schedule activities for each stop. If you use a database activity, use its EXACT activity_id (UUID) and cost_estimate.
- Every activity you schedule MUST belong to that stop's city in the database dump.
- Pick exactly one hotel per stop using the EXACT hotel_id (UUID) listed for that stop's city. Match the hotel's budget_category to the traveller's budget preference (low/moderate/premium/luxury). Use null only if the dump lists no hotel for that city.
- If the database lacks a specific activity, you can invent a custom one by setting activity_id to null and providing a custom_name.
- You must assign sequential order_index (starting at 0) to stops.
- Stops must not overlap: each stop's start_date must be on or after the previous stop's end_date, and every date must stay inside the traveller's overall trip window.
- Schedule 2-4 activities per day at a moderate pace, fewer when the pace is slow, more when fast-paced.
- Format times as ISO-8601 strings (e.g. 2026-10-01T09:00:00Z) if start_date is known, otherwise pick arbitrary sequential dates starting today.

You MUST respond strictly with a valid JSON object matching this structure:
{
  "stops": [
    {
      "city_id": "uuid-of-city",
      "hotel_id": "uuid-of-hotel-or-null",
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

def _resolve_cities(request: GenerateItineraryRequest, db: Session) -> list[City]:
    """Find the DB cities the itinerary may use, falling back to popular ones."""
    from sqlalchemy import or_

    cities: list[City] = []
    if request.destinations:
        conditions = [City.name.ilike(f"%{dest}%") for dest in request.destinations]
        cities = db.query(City).filter(or_(*conditions)).limit(10).all()

    if not cities:
        cities = db.query(City).order_by(City.popularity.desc()).limit(5).all()

    return cities


def _build_db_context(cities: list[City], db: Session) -> str:
    """Dump the cities, activities and hotels Gemini is allowed to choose from."""
    cities_data = []
    activities_data = []
    hotels_data = []

    for city in cities:
        cities_data.append({
            "city_id": str(city.id),
            "name": city.name,
            "state": city.state,
        })

        for act in db.query(Activity).filter(Activity.city_id == city.id).order_by(
            Activity.rating.desc().nullslast()
        ).limit(15).all():
            activities_data.append({
                "activity_id": str(act.id),
                "city_id": str(city.id),
                "city_name": city.name,
                "name": act.name,
                "category": act.category,
                "default_cost": act.default_cost,
                "duration_minutes": act.default_duration_minutes,
            })

        for hotel in db.query(Hotel).filter(Hotel.city_id == city.id).order_by(
            Hotel.rating.desc().nullslast()
        ).limit(10).all():
            hotels_data.append({
                "hotel_id": str(hotel.id),
                "city_id": str(city.id),
                "city_name": city.name,
                "name": hotel.name,
                "hotel_type": hotel.hotel_type,
                "price_per_night": hotel.price_per_night,
                "budget_category": hotel.budget_category,
                "rating": hotel.rating,
            })

    return json.dumps({
        "available_cities": cities_data,
        "available_activities": activities_data,
        "available_hotels": hotels_data,
    })


def _as_uuid(value) -> Optional[uuid.UUID]:
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


def _as_date(value) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def _sanitize_stops(
    parsed_data: dict,
    db: Session,
    allowed_cities: list[City],
    trip_start: Optional[date] = None,
    trip_end: Optional[date] = None,
) -> list[dict]:
    """Keep only what the database can actually confirm.

    A language model can hallucinate UUIDs, cross-assign a Goa hotel to a Jaipur stop, or
    drift outside the trip window, so every id and date is re-checked here before it is
    ever written to the database.
    """
    allowed_city_ids = {city.id for city in allowed_cities}
    stops_in = parsed_data.get("stops") or []

    clean_stops: list[dict] = []
    cursor = trip_start

    for stop_in in stops_in:
        city_id = _as_uuid(stop_in.get("city_id"))
        if not city_id or city_id not in allowed_city_ids:
            logger.warning("Dropping AI stop with unknown city_id: %s", stop_in.get("city_id"))
            continue

        # Dates: trust the model, but keep them ordered and inside the trip window.
        start = _as_date(stop_in.get("start_date")) or cursor or date.today()
        end = _as_date(stop_in.get("end_date")) or start
        if cursor and start < cursor:
            start = cursor
        if end < start:
            end = start
        if trip_end:
            start = min(start, trip_end)
            end = min(end, trip_end)

        # Hotel must exist and belong to this stop's city.
        hotel_id = _as_uuid(stop_in.get("hotel_id"))
        if hotel_id:
            hotel = db.query(Hotel).filter(Hotel.id == hotel_id, Hotel.city_id == city_id).first()
            if not hotel:
                logger.warning("Dropping AI hotel not in city %s: %s", city_id, hotel_id)
                hotel_id = None

        clean_activities = []
        for act_in in stop_in.get("activities") or []:
            activity_id = _as_uuid(act_in.get("activity_id"))
            catalog = None
            if activity_id:
                catalog = db.query(Activity).filter(
                    Activity.id == activity_id, Activity.city_id == city_id
                ).first()
                if not catalog:
                    logger.warning("Dropping AI activity not in city %s: %s", city_id, activity_id)
                    activity_id = None

            custom_name = (act_in.get("custom_name") or (catalog.name if catalog else "")).strip()
            if not custom_name:
                continue

            scheduled = act_in.get("scheduled_time")
            scheduled_date = _as_date(scheduled)
            if not scheduled_date or scheduled_date < start or scheduled_date > end:
                scheduled = f"{start.isoformat()}T{9 + min(len(clean_activities) * 2, 10):02d}:00:00Z"

            cost = act_in.get("cost_estimate")
            if cost is None:
                cost = catalog.default_cost if catalog else 0.0

            clean_activities.append({
                "activity_id": str(activity_id) if activity_id else None,
                "custom_name": custom_name,
                "scheduled_time": scheduled,
                "cost_estimate": float(cost),
                "notes": act_in.get("notes"),
            })

        clean_stops.append({
            "city_id": str(city_id),
            "hotel_id": str(hotel_id) if hotel_id else None,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "order_index": len(clean_stops),
            "activities": clean_activities,
        })
        cursor = end

    return clean_stops


def generate_itinerary_from_db(request: GenerateItineraryRequest, db: Session) -> GenerateItineraryResponse:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured."
        )

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    cities = _resolve_cities(request, db)
    if not cities:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No cities available in the database to build an itinerary from."
        )

    db_context_json = _build_db_context(cities, db)
    user_context = f"Intent: {request.model_dump_json()}\n\nDatabase Context: {db_context_json}"

    response = _generate_with_retry(
        client,
        contents=user_context,
        config=types.GenerateContentConfig(
            system_instruction=ITINERARY_SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.3
        ),
        label="itinerary",
    )

    raw_json = response.text.strip()
    if raw_json.startswith("```"):
        raw_json = raw_json.strip("`").removeprefix("json").strip()

    try:
        parsed_data = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        logger.error(f"Failed to parse Gemini itinerary as JSON: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Malformed itinerary output from Gemini: {str(exc)}"
        )

    clean_stops = _sanitize_stops(
        parsed_data,
        db,
        cities,
        trip_start=_as_date(request.start_date),
        trip_end=_as_date(request.end_date),
    )

    if not clean_stops:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini did not return any itinerary stops that match our database."
        )

    return GenerateItineraryResponse(stops=clean_stops)

