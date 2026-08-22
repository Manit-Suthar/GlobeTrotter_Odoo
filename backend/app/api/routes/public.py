from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.share import PublicItinerary
from app.services import share_service

router = APIRouter()

@router.get("/trips/{share_token}", response_model=PublicItinerary)
def get_public_trip(
    share_token: str,
    db: Session = Depends(get_db)
):
    return share_service.get_public_itinerary(db=db, share_token=share_token)
