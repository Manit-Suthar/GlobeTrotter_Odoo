from pydantic import BaseModel
import uuid
from typing import List
from app.schemas.trip import TripRead
from app.schemas.itinerary import ItineraryStop

class ShareResponse(BaseModel):
    share_token: str
    url: str

class PublicItinerary(BaseModel):
    trip: TripRead
    stops: List[ItineraryStop]
