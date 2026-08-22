import uuid
from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    cost_index = Column(Float, nullable=True, default=1.0)
    popularity = Column(Integer, default=0, index=True)

    activities = relationship("Activity", back_populates="city", cascade="all, delete-orphan", passive_deletes=True)
    trip_stops = relationship("TripStop", back_populates="city")

    def __repr__(self) -> str:
        return f"<City(id={self.id}, name='{self.name}', country='{self.country}')>"
