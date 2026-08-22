from pydantic import BaseModel, Field
from typing import List, Optional

class TripSuggestionRequest(BaseModel):
    prompt: str

class TripSuggestionResponse(BaseModel):
    suggestions: str

class TripIntentRequest(BaseModel):
    title: str = Field(..., description="Title of the trip", json_schema_extra={"example": "Backpacking in Rajasthan"})
    start_date: Optional[str] = Field(None, description="Start date (YYYY-MM-DD)", json_schema_extra={"example": "2026-10-01"})
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM-DD)", json_schema_extra={"example": "2026-10-08"})
    description: Optional[str] = Field(None, description="Detailed trip description/notes", json_schema_extra={"example": "Looking for budget stay, rich history, street food in Jaipur and Udaipur. Prefer slow pace and vegetarian food."})


class TripIntentResponse(BaseModel):
    title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    trip_duration_days: Optional[int] = Field(None, description="Calculated or estimated trip duration in days")
    travel_interests: List[str] = Field(default_factory=list, description="Extracted travel interests, e.g. heritage, nature, food")
    preferred_travel_style: Optional[str] = Field(None, description="Travel style, e.g. budget, luxury, solo, family, adventure")
    pace: Optional[str] = Field(None, description="Pace of travel, e.g. slow, moderate, fast-paced")
    budget_preference: Optional[str] = Field(None, description="Budget level or explicit budget mentioned")
    destinations: List[str] = Field(default_factory=list, description="Relevant cities, states, or regions mentioned")
    additional_constraints: List[str] = Field(default_factory=list, description="Explicit constraints e.g. vegetarian, wheelchair accessible")
    summary: Optional[str] = Field(None, description="Concise summary of the extracted intent")

