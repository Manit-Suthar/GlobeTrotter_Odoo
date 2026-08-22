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
