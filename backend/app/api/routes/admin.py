from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.trip import Trip, TripStop, TripActivity
from app.models.city import City
from pydantic import BaseModel

router = APIRouter()

class PopularCity(BaseModel):
    name: str
    count: int

class AdminAnalytics(BaseModel):
    totalUsers: int
    totalTrips: int
    totalCities: int
    totalActivities: int
    averageTripCost: float
    popularCities: list[PopularCity]

@router.get("/analytics", response_model=AdminAnalytics)
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Basic MVP metrics
    users_count = db.query(User).count()
    trips_count = db.query(Trip).count()
    cities_count = db.query(City).count()
    activities_count = db.query(TripActivity).count()
    
    # Average trip cost (just activity costs for MVP sum)
    total_cost = db.query(func.sum(TripActivity.cost_estimate)).scalar() or 0
    avg_cost = total_cost / trips_count if trips_count > 0 else 0

    return AdminAnalytics(
        totalUsers=users_count,
        totalTrips=trips_count,
        totalCities=cities_count,
        totalActivities=activities_count,
        averageTripCost=avg_cost,
        popularCities=[
            PopularCity(name="Tokyo", count=12),
            PopularCity(name="Paris", count=8)
        ] # Mocked popular cities since complex aggregation is out of MVP scope
    )
