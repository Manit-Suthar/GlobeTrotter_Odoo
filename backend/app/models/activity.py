import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True, index=True)
    default_cost = Column(Float, default=0.0, nullable=False)
    default_duration_minutes = Column(Integer, default=60, nullable=False)
    rating = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    tags = Column(String(255), nullable=True)

    city = relationship("City", back_populates="activities")
    trip_activities = relationship("TripActivity", back_populates="activity")

    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, name='{self.name}', category='{self.category}', cost={self.default_cost})>"
