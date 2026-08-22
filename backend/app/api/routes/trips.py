from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.trip import TripCreate, TripRead, TripUpdate
from app.services import trip_service

router = APIRouter()

@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return trip_service.create_trip(db=db, trip_in=trip_in, user_id=current_user.id)

@router.get("", response_model=List[TripRead])
def read_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return trip_service.get_trips_for_user(db=db, user_id=current_user.id)

@router.get("/{trip_id}", response_model=TripRead)
def read_trip(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return trip_service.get_trip(db=db, trip_id=trip_id, user_id=current_user.id)

@router.patch("/{trip_id}", response_model=TripRead)
def update_trip(
    trip_id: uuid.UUID,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return trip_service.update_trip(db=db, trip_id=trip_id, trip_in=trip_in, user_id=current_user.id)

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip_service.delete_trip(db=db, trip_id=trip_id, user_id=current_user.id)

from app.schemas.itinerary import (
    TripStopCreate, TripStopRead, TripStopUpdate, TripStopReorder, ItineraryRead
)
from app.services import itinerary_service

@router.post("/{trip_id}/stops", response_model=TripStopRead, status_code=status.HTTP_201_CREATED)
def create_stop(
    trip_id: uuid.UUID,
    stop_in: TripStopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return itinerary_service.create_stop(db=db, trip_id=trip_id, stop_in=stop_in, user_id=current_user.id)

@router.patch("/{trip_id}/stops/reorder", status_code=status.HTTP_200_OK)
def reorder_stops(
    trip_id: uuid.UUID,
    reorder_in: TripStopReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_service.reorder_stops(db=db, trip_id=trip_id, reorder_in=reorder_in, user_id=current_user.id)
    return {"message": "Reordered successfully"}

@router.patch("/{trip_id}/stops/{stop_id}", response_model=TripStopRead)
def update_stop(
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    stop_in: TripStopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return itinerary_service.update_stop(db=db, trip_id=trip_id, stop_id=stop_id, stop_in=stop_in, user_id=current_user.id)

@router.delete("/{trip_id}/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(
    trip_id: uuid.UUID,
    stop_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_service.delete_stop(db=db, trip_id=trip_id, stop_id=stop_id, user_id=current_user.id)

@router.get("/{trip_id}/itinerary", response_model=ItineraryRead)
def get_itinerary(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return itinerary_service.get_itinerary(db=db, trip_id=trip_id, user_id=current_user.id)

from app.schemas.budget import BudgetResponse
from app.services import budget_service

@router.get("/{trip_id}/budget", response_model=BudgetResponse)
def get_budget(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return budget_service.get_trip_budget(db=db, trip_id=trip_id, user_id=current_user.id)

from app.schemas.share import ShareResponse
from app.services import share_service

@router.post("/{trip_id}/share", response_model=ShareResponse)
def share_trip(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return share_service.share_trip(db=db, trip_id=trip_id, user_id=current_user.id)

@router.delete("/{trip_id}/share", status_code=status.HTTP_204_NO_CONTENT)
def unshare_trip(
    trip_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    share_service.unshare_trip(db=db, trip_id=trip_id, user_id=current_user.id)


