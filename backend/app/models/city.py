import uuid
from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    cost_index = Column(Float)
    popularity = Column(Integer, default=0)

    activities = relationship("Activity", back_populates="city")
