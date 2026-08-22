import uuid
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.activity import Activity
from app.models.city import City

router = APIRouter()

class ActivityRead(BaseModel):
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

@router.get("", response_model=list[ActivityRead])
def list_activities(
    city_id: uuid.UUID | None = None,
    query: str | None = Query(None, min_length=1),
    db: Session = Depends(get_db),
):
    records = db.query(Activity, City.name.label("city")).join(City, Activity.city_id == City.id)
    if city_id:
        records = records.filter(Activity.city_id == city_id)
    if query:
        pattern = f"%{query.strip()}%"
        records = records.filter((Activity.name.ilike(pattern)) | (Activity.tags.ilike(pattern)) | (City.name.ilike(pattern)))
    return [
        ActivityRead(
            id=activity.id, city_id=activity.city_id, city=city, name=activity.name,
            description=activity.description, category=activity.category,
            default_cost=activity.default_cost, default_duration_minutes=activity.default_duration_minutes,
            rating=activity.rating, image_url=activity.image_url, tags=activity.tags,
        )
        for activity, city in records.order_by(Activity.name).all()
    ]
