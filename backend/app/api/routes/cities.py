from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.city import City
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

@router.get("", response_model=List[CityRead])
def get_all_cities(db: Session = Depends(get_db)):
    return db.query(City).order_by(City.name).all()
