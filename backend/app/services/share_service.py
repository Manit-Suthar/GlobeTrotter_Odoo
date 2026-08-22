import uuid
import secrets
from sqlalchemy.orm import Session

from app.models.trip import TripShare, Trip, TripStop, TripActivity
from app.schemas.share import ShareResponse, PublicItinerary
from app.schemas.trip import TripRead
from app.schemas.itinerary import ItineraryStop, ItineraryActivity
from app.core.exceptions import NotFoundException
from app.services.trip_service import get_trip

def share_trip(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> ShareResponse:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    
    # Check if already shared publicly
    existing_share = db.query(TripShare).filter(TripShare.trip_id == trip_id, TripShare.share_type == "public").first()
    if existing_share:
        token = existing_share.share_token
    else:
        token = secrets.token_urlsafe(32)
        share_record = TripShare(
            trip_id=trip_id,
            share_token=token,
            share_type="public"
        )
        db.add(share_record)
        db.commit()

    return ShareResponse(
        share_token=token,
        url=f"/public/trips/{token}" # The frontend handles the full domain
    )

def unshare_trip(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> None:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    shares = db.query(TripShare).filter(TripShare.trip_id == trip_id, TripShare.share_type == "public").all()
    for s in shares:
        db.delete(s)
    db.commit()

def get_public_itinerary(db: Session, share_token: str) -> PublicItinerary:
    share = db.query(TripShare).filter(TripShare.share_token == share_token, TripShare.share_type == "public").first()
    if not share:
        raise NotFoundException("Invalid or expired share token")
        
    trip = db.query(Trip).filter(Trip.id == share.trip_id).first()
    if not trip:
        raise NotFoundException("Shared trip not found")
        
    stops = db.query(TripStop).filter(TripStop.trip_id == trip.id).order_by(TripStop.order_index).all()
    
    itinerary_stops = []
    for stop in stops:
        activities = db.query(TripActivity).filter(TripActivity.trip_stop_id == stop.id).order_by(TripActivity.scheduled_time).all()
        itinerary_stops.append(ItineraryStop(
            **stop.__dict__,
            activities=[ItineraryActivity(**a.__dict__) for a in activities]
        ))
        
    return PublicItinerary(
        trip=TripRead.model_validate(trip),
        stops=itinerary_stops
    )
