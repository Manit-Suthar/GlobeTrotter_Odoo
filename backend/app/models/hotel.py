import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    hotel_type = Column(String(50), nullable=True)
    price_per_night = Column(Float, default=0.0, nullable=False)
    rating = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    budget_category = Column(String(20), nullable=True, index=True)
    nearby_area = Column(String(100), nullable=True)
    popularity_score = Column(Integer, default=0)
    tags = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)

    city = relationship("City", back_populates="hotels")
    trip_stops = relationship("TripStop", back_populates="hotel")

    def __repr__(self) -> str:
        return f"<Hotel(id={self.id}, name='{self.name}', type='{self.hotel_type}', price={self.price_per_night})>"
