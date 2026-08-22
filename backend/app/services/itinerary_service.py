import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.trip import Trip, TripStop, TripActivity
from app.schemas.itinerary import (
    TripStopCreate, TripStopUpdate, TripStopReorder,
    TripActivityCreate, TripActivityUpdate, ItineraryRead, ItineraryStop, ItineraryActivity
)
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.services.trip_service import get_trip

# --- Trip Stops ---

def create_stop(db: Session, trip_id: uuid.UUID, stop_in: TripStopCreate, user_id: uuid.UUID) -> TripStop:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    
    # get max order index
    max_order = db.query(func.max(TripStop.order_index)).filter(TripStop.trip_id == trip_id).scalar()
    next_order = (max_order or 0) + 1
    
    db_stop = TripStop(
        trip_id=trip_id,
        city_id=stop_in.city_id,
        order_index=next_order,
        start_date=stop_in.start_date,
        end_date=stop_in.end_date
    )
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    return db_stop

def get_stop(db: Session, trip_id: uuid.UUID, stop_id: uuid.UUID, user_id: uuid.UUID) -> TripStop:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id) # validates ownership
    stop = db.query(TripStop).filter(TripStop.id == stop_id, TripStop.trip_id == trip_id).first()
    if not stop:
        raise NotFoundException("Trip stop not found")
    return stop

def update_stop(db: Session, trip_id: uuid.UUID, stop_id: uuid.UUID, stop_in: TripStopUpdate, user_id: uuid.UUID) -> TripStop:
    db_stop = get_stop(db, trip_id, stop_id, user_id)
    update_data = stop_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_stop, field, value)
        
    db.commit()
    db.refresh(db_stop)
    return db_stop

def delete_stop(db: Session, trip_id: uuid.UUID, stop_id: uuid.UUID, user_id: uuid.UUID) -> None:
    db_stop = get_stop(db, trip_id, stop_id, user_id)
    db.delete(db_stop)
    db.commit()

def reorder_stops(db: Session, trip_id: uuid.UUID, reorder_in: TripStopReorder, user_id: uuid.UUID) -> None:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    for stop_order in reorder_in.stops:
        stop = db.query(TripStop).filter(TripStop.id == stop_order.id, TripStop.trip_id == trip_id).first()
        if stop:
            stop.order_index = stop_order.order_index
    db.commit()

# --- Trip Activities ---

def get_stop_by_id(db: Session, stop_id: uuid.UUID, user_id: uuid.UUID) -> TripStop:
    stop = db.query(TripStop).filter(TripStop.id == stop_id).first()
    if not stop:
        raise NotFoundException("Trip stop not found")
    # validate trip ownership
    get_trip(db, trip_id=stop.trip_id, user_id=user_id) 
    return stop

def create_activity(db: Session, stop_id: uuid.UUID, activity_in: TripActivityCreate, user_id: uuid.UUID) -> TripActivity:
    stop = get_stop_by_id(db, stop_id, user_id)
    db_activity = TripActivity(
        trip_stop_id=stop_id,
        activity_id=activity_in.activity_id,
        custom_name=activity_in.custom_name,
        scheduled_time=activity_in.scheduled_time,
        cost_estimate=activity_in.cost_estimate,
        notes=activity_in.notes
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def get_activity(db: Session, stop_id: uuid.UUID, activity_id: uuid.UUID, user_id: uuid.UUID) -> TripActivity:
    stop = get_stop_by_id(db, stop_id, user_id)
    activity = db.query(TripActivity).filter(TripActivity.id == activity_id, TripActivity.trip_stop_id == stop_id).first()
    if not activity:
        raise NotFoundException("Activity not found")
    return activity

def update_activity(db: Session, stop_id: uuid.UUID, activity_id: uuid.UUID, activity_in: TripActivityUpdate, user_id: uuid.UUID) -> TripActivity:
    db_activity = get_activity(db, stop_id, activity_id, user_id)
    update_data = activity_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_activity, field, value)
        
    db.commit()
    db.refresh(db_activity)
    return db_activity

def delete_activity(db: Session, stop_id: uuid.UUID, activity_id: uuid.UUID, user_id: uuid.UUID) -> None:
    db_activity = get_activity(db, stop_id, activity_id, user_id)
    db.delete(db_activity)
    db.commit()

# --- Itinerary Construction ---

def get_itinerary(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> ItineraryRead:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    
    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).order_by(TripStop.order_index).all()
    
    itinerary_stops = []
    for stop in stops:
        activities = db.query(TripActivity).filter(TripActivity.trip_stop_id == stop.id).order_by(TripActivity.scheduled_time).all()
        itinerary_stops.append(ItineraryStop(
            **stop.__dict__,
            activities=[ItineraryActivity(**a.__dict__) for a in activities]
        ))
        
    return ItineraryRead(
        trip_id=trip_id,
        stops=itinerary_stops
    )

from app.schemas.itinerary import ItineraryBulkUpdate

def bulk_update_itinerary(db: Session, trip_id: uuid.UUID, bulk_in: ItineraryBulkUpdate, user_id: uuid.UUID) -> ItineraryRead:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    
    # 1. Wipe existing stops (cascade will delete activities)
    db.query(TripStop).filter(TripStop.trip_id == trip_id).delete()
    db.commit()
    
    # 2. Re-create everything
    for stop_in in bulk_in.stops:
        db_stop = TripStop(
            trip_id=trip_id,
            city_id=stop_in.city_id,
            order_index=stop_in.order_index,
            start_date=stop_in.start_date,
            end_date=stop_in.end_date
        )
        db.add(db_stop)
        db.flush() # get stop id
        
        for act_idx, act_in in enumerate(stop_in.activities):
            real_act_id = None
            try:
                # If activity_id is a valid UUID, use it. The frontend might send sys-1234
                if act_in.activity_id and len(act_in.activity_id) == 36:
                    real_act_id = uuid.UUID(act_in.activity_id)
            except:
                pass

            db_act = TripActivity(
                trip_stop_id=db_stop.id,
                activity_id=real_act_id,
                custom_name=act_in.custom_name,
                scheduled_time=act_in.scheduled_time,
                cost_estimate=act_in.cost_estimate,
                notes=act_in.notes,
                order_index=act_idx
            )
            db.add(db_act)
    
    db.commit()
    return get_itinerary(db, trip_id, user_id)
