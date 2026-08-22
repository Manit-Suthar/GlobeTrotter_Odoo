import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    default_cost = Column(Float, default=0.0)
    default_duration_minutes = Column(Integer, default=60)

    city = relationship("City", back_populates="activities")
