import uuid
from sqlalchemy import Column, String, Date, Text, DateTime, ForeignKey, func, Enum, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    cover_photo = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="trips")
    stops = relationship("TripStop", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    shares = relationship("TripShare", back_populates="trip", cascade="all, delete-orphan")

class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)
    order_index = Column(Integer, default=0)
    start_date = Column(Date)
    end_date = Column(Date)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City")
    activities = relationship("TripActivity", back_populates="stop", cascade="all, delete-orphan")

class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_stop_id = Column(UUID(as_uuid=True), ForeignKey("trip_stops.id"), nullable=False)
    activity_id = Column(UUID(as_uuid=True), ForeignKey("activities.id"), nullable=True)
    custom_name = Column(String)
    scheduled_time = Column(DateTime)
    cost_estimate = Column(Float, default=0.0)
    notes = Column(Text)

    stop = relationship("TripStop", back_populates="activities")
    activity = relationship("Activity")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    category = Column(String, nullable=False) # e.g. transport, stay, activities, meals
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    description = Column(String)
    date = Column(Date)

    trip = relationship("Trip", back_populates="expenses")

class TripShare(Base):
    __tablename__ = "trip_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    share_token = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))

    trip = relationship("Trip", back_populates="shares")
