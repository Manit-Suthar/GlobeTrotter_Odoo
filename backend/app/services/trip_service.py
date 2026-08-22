import uuid
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripUpdate
from app.core.exceptions import NotFoundException, ForbiddenException

def create_trip(db: Session, trip_in: TripCreate, user_id: uuid.UUID) -> Trip:
    db_trip = Trip(
        user_id=user_id,
        name=trip_in.name,
        description=trip_in.description,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        cover_photo=trip_in.cover_photo
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

def get_trip(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise NotFoundException("Trip not found")
    if trip.user_id != user_id:
        raise ForbiddenException("Not authorized to access this trip")
    return trip

def get_trips_for_user(db: Session, user_id: uuid.UUID) -> list[Trip]:
    return db.query(Trip).filter(Trip.user_id == user_id).all()

def update_trip(db: Session, trip_id: uuid.UUID, trip_in: TripUpdate, user_id: uuid.UUID) -> Trip:
    db_trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    update_data = trip_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_trip, field, value)
        
    db.commit()
    db.refresh(db_trip)
    return db_trip

def delete_trip(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> None:
    db_trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    db.delete(db_trip)
    db.commit()
