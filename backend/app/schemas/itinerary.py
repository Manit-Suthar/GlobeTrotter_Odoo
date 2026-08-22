from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
import uuid

# --- Trip Stop Schemas ---
class TripStopBase(BaseModel):
    city_id: uuid.UUID
    start_date: date
    end_date: date

class TripStopCreate(TripStopBase):
    pass

class TripStopUpdate(BaseModel):
    city_id: Optional[uuid.UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class StopOrder(BaseModel):
    id: uuid.UUID
    order_index: int

class TripStopReorder(BaseModel):
    stops: List[StopOrder]

class TripStopRead(TripStopBase):
    id: uuid.UUID
    trip_id: uuid.UUID
    order_index: int

    class Config:
        from_attributes = True

# --- Trip Activity Schemas ---
class TripActivityBase(BaseModel):
    activity_id: Optional[uuid.UUID] = None
    custom_name: Optional[str] = None
    scheduled_time: datetime
    cost_estimate: float
    notes: Optional[str] = None

class TripActivityCreate(TripActivityBase):
    pass

class TripActivityUpdate(BaseModel):
    activity_id: Optional[uuid.UUID] = None
    custom_name: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    cost_estimate: Optional[float] = None
    notes: Optional[str] = None

class TripActivityRead(TripActivityBase):
    id: uuid.UUID
    trip_stop_id: uuid.UUID

    class Config:
        from_attributes = True

# --- Itinerary Read Schema (Nested) ---
class ItineraryActivity(TripActivityRead):
    pass # Can expand later with activity details

class ItineraryStop(TripStopRead):
    activities: List[ItineraryActivity] = []

class ItineraryRead(BaseModel):
    trip_id: uuid.UUID
    stops: List[ItineraryStop] = []
