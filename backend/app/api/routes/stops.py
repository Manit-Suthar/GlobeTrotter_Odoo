from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import uuid

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.itinerary import (
    TripActivityCreate, TripActivityRead, TripActivityUpdate
)
from app.services import itinerary_service

router = APIRouter()

@router.post("/{stop_id}/activities", response_model=TripActivityRead, status_code=status.HTTP_201_CREATED)
def create_activity(
    stop_id: uuid.UUID,
    activity_in: TripActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return itinerary_service.create_activity(db=db, stop_id=stop_id, activity_in=activity_in, user_id=current_user.id)

@router.patch("/{stop_id}/activities/{activity_id}", response_model=TripActivityRead)
def update_activity(
    stop_id: uuid.UUID,
    activity_id: uuid.UUID,
    activity_in: TripActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return itinerary_service.update_activity(db=db, stop_id=stop_id, activity_id=activity_id, activity_in=activity_in, user_id=current_user.id)

@router.delete("/{stop_id}/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    stop_id: uuid.UUID,
    activity_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_service.delete_activity(db=db, stop_id=stop_id, activity_id=activity_id, user_id=current_user.id)
