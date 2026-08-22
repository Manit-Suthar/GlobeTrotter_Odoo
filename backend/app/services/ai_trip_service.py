"""One-shot AI trip creation.

Ties the two Gemini phases together and writes the result straight into the database,
so a traveller describes a trip once and lands on a finished itinerary — no manual
stop-by-stop assembly.
"""
import datetime
import logging
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai import gemini_service
from app.models.trip import Trip
from app.schemas.ai import (
    AutoCreateTripRequest,
    AutoCreateTripResponse,
    GenerateItineraryRequest,
    TripIntentRequest,
)
from app.schemas.itinerary import ItineraryBulkUpdate
from app.services import itinerary_service

logger = logging.getLogger(__name__)

DEFAULT_TRIP_DAYS = 5


def _resolve_dates(request: AutoCreateTripRequest, duration_days: int | None) -> tuple[datetime.date, datetime.date]:
    """Work out a concrete trip window from whatever the traveller supplied."""
    start = gemini_service._as_date(request.start_date)
    end = gemini_service._as_date(request.end_date)

    if start and end and end >= start:
        return start, end

    if start and not end:
        span = (duration_days or DEFAULT_TRIP_DAYS) - 1
        return start, start + datetime.timedelta(days=max(span, 1))

    if end and not start:
        span = (duration_days or DEFAULT_TRIP_DAYS) - 1
        return end - datetime.timedelta(days=max(span, 1)), end

    # Nothing usable given: start a week out so the plan is actionable.
    start = datetime.date.today() + datetime.timedelta(days=7)
    span = (duration_days or DEFAULT_TRIP_DAYS) - 1
    return start, start + datetime.timedelta(days=max(span, 1))


def create_trip_from_prompt(
    db: Session, request: AutoCreateTripRequest, user_id: uuid.UUID
) -> AutoCreateTripResponse:
    # --- Phase 1: what does the traveller actually want? ---
    intent = gemini_service.parse_trip_intent(TripIntentRequest(
        title=request.title,
        start_date=request.start_date,
        end_date=request.end_date,
        description=request.description,
    ))

    start_date, end_date = _resolve_dates(request, intent.trip_duration_days)

    # --- Phase 2: build the itinerary out of real database rows ---
    generated = gemini_service.generate_itinerary_from_db(
        GenerateItineraryRequest(
            title=intent.title,
            trip_duration_days=intent.trip_duration_days or ((end_date - start_date).days + 1),
            travel_interests=intent.travel_interests,
            preferred_travel_style=intent.preferred_travel_style,
            pace=intent.pace,
            budget_preference=intent.budget_preference or intent.estimated_budget_range,
            destinations=intent.destinations,
            additional_constraints=intent.additional_constraints,
            description=request.description,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
        ),
        db,
    )

    # --- Persist: trip first, then the whole itinerary in one write ---
    trip = Trip(
        user_id=user_id,
        name=intent.title or request.title or "AI Planned Trip",
        description=intent.summary or request.description,
        start_date=start_date,
        end_date=end_date,
        cover_photo=request.cover_image,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    try:
        itinerary_service.bulk_update_itinerary(
            db=db,
            trip_id=trip.id,
            bulk_in=ItineraryBulkUpdate(stops=generated.stops),
            user_id=user_id,
        )
    except Exception as exc:
        # Never leave a half-built trip behind.
        logger.error(f"Failed to persist AI itinerary, rolling back trip {trip.id}: {exc}")
        db.rollback()
        db.delete(trip)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The generated itinerary could not be saved. Please try again."
        )

    return AutoCreateTripResponse(
        trip_id=trip.id,
        name=trip.name,
        start_date=start_date,
        end_date=end_date,
        stops_created=len(generated.stops),
        activities_created=sum(len(stop.activities) for stop in generated.stops),
        hotels_selected=sum(1 for stop in generated.stops if stop.hotel_id),
        summary=intent.summary,
        intent=intent,
    )
