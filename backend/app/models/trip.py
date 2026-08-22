import uuid
from sqlalchemy import Column, String, Date, Text, DateTime, ForeignKey, func, Float, Integer, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    cover_photo = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="trips")
    stops = relationship(
        "TripStop",
        back_populates="trip",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="TripStop.order_index"
    )
    expenses = relationship(
        "Expense",
        back_populates="trip",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    shares = relationship(
        "TripShare",
        back_populates="trip",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self) -> str:
        return f"<Trip(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_index = Column(Integer, default=0, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="trip_stops")
    activities = relationship(
        "TripActivity",
        back_populates="stop",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="TripActivity.order_index"
    )

    __table_args__ = (
        Index("idx_trip_stops_trip_order", "trip_id", "order_index"),
    )

    def __repr__(self) -> str:
        return f"<TripStop(id={self.id}, trip_id={self.trip_id}, city_id={self.city_id}, order={self.order_index})>"


class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_stop_id = Column(UUID(as_uuid=True), ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(UUID(as_uuid=True), ForeignKey("activities.id", ondelete="SET NULL"), nullable=True, index=True)
    custom_name = Column(String(200), nullable=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    cost_estimate = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    stop = relationship("TripStop", back_populates="activities")
    activity = relationship("Activity", back_populates="trip_activities")

    __table_args__ = (
        Index("idx_trip_activities_stop_order", "trip_stop_id", "order_index"),
    )

    def __repr__(self) -> str:
        return f"<TripActivity(id={self.id}, trip_stop_id={self.trip_stop_id}, custom_name='{self.custom_name}')>"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # e.g. transport, stay, activities, meals, shopping, other
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    trip = relationship("Trip", back_populates="expenses")

    __table_args__ = (
        Index("idx_expenses_trip_category", "trip_id", "category"),
    )

    def __repr__(self) -> str:
        return f"<Expense(id={self.id}, trip_id={self.trip_id}, category='{self.category}', amount={self.amount})>"


class TripShare(Base):
    __tablename__ = "trip_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    share_token = Column(String(64), unique=True, index=True, nullable=False)
    share_type = Column(String(20), default="public", nullable=False)  # "public" or "friend"
    shared_with_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    trip = relationship("Trip", back_populates="shares")

    def __repr__(self) -> str:
        return f"<TripShare(id={self.id}, trip_id={self.trip_id}, token='{self.share_token}', type='{self.share_type}')>"
