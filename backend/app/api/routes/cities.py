from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.city import City
from app.models.activity import Activity
from app.models.hotel import Hotel
from pydantic import BaseModel
import uuid
from typing import List

router = APIRouter()

class CityRead(BaseModel):
    id: uuid.UUID
    name: str
    country: str
    popularity_score: float | None = None
    cost_index: float | None = None
    image_url: str | None = None

    class Config:
        from_attributes = True

class CityActivityRead(BaseModel):
    id: uuid.UUID
    city_id: uuid.UUID
    city: str
    name: str
    description: str | None = None
    category: str | None = None
    default_cost: float
    default_duration_minutes: int
    rating: float | None = None
    image_url: str | None = None
    tags: str | None = None

@router.get("", response_model=List[CityRead])
def get_all_cities(db: Session = Depends(get_db)):
    return db.query(City).order_by(City.name).all()

class HotelRead(BaseModel):
    id: uuid.UUID
    city_id: uuid.UUID
    name: str
    hotel_type: str | None = None
    price_per_night: float
    rating: float | None = None
    budget_category: str | None = None
    nearby_area: str | None = None
    tags: str | None = None
    image_url: str | None = None

    class Config:
        from_attributes = True

@router.get("/{city_id}/hotels", response_model=List[HotelRead])
def get_city_hotels(
    city_id: uuid.UUID,
    budget_category: str | None = None,
    db: Session = Depends(get_db),
):
    records = db.query(Hotel).filter(Hotel.city_id == city_id)
    if budget_category:
        records = records.filter(Hotel.budget_category == budget_category.lower())
    return records.order_by(Hotel.rating.desc().nullslast(), Hotel.popularity_score.desc()).all()

@router.get("/{city_id}/activities", response_model=List[CityActivityRead])
def get_city_activities(city_id: uuid.UUID, db: Session = Depends(get_db)):
    records = (
        db.query(Activity, City.name.label("city"))
        .join(City, Activity.city_id == City.id)
        .filter(Activity.city_id == city_id)
        .order_by(Activity.rating.desc().nullslast(), Activity.name)
        .all()
    )
    return [
        CityActivityRead(
            id=activity.id, city_id=activity.city_id, city=city, name=activity.name,
            description=activity.description, category=activity.category,
            default_cost=activity.default_cost, default_duration_minutes=activity.default_duration_minutes,
            rating=activity.rating, image_url=activity.image_url, tags=activity.tags,
        )
        for activity, city in records
    ]
