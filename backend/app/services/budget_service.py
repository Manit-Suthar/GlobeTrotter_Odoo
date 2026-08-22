import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict

from app.models.trip import Trip, Expense, TripStop, TripActivity
from app.models.hotel import Hotel
from app.schemas.budget import BudgetResponse
from app.services.trip_service import get_trip

def get_trip_budget(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> BudgetResponse:
    trip = get_trip(db, trip_id=trip_id, user_id=user_id)
    
    # Calculate days for daily_average
    days = 1
    if trip.start_date and trip.end_date:
        days = (trip.end_date - trip.start_date).days
        if days <= 0:
            days = 1
            
    categories = defaultdict(float)
    total = 0.0
    
    # 1. Sum up explicit expenses
    expenses = db.query(Expense.category, func.sum(Expense.amount)).filter(Expense.trip_id == trip_id).group_by(Expense.category).all()
    for cat, amount in expenses:
        if amount:
            categories[cat] += float(amount)
            total += float(amount)
            
    # 2. Sum up activity estimates (assuming they belong to "activities" category unless specified)
    # Get all stops for the trip
    stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).all()
    stops_ids = [stop.id for stop in stops]
    if stops_ids:
        activity_sum = db.query(func.sum(TripActivity.cost_estimate)).filter(TripActivity.trip_stop_id.in_(stops_ids)).scalar()
        if activity_sum:
            categories["activities"] += float(activity_sum)
            total += float(activity_sum)

    # 3. Sum up selected hotels: nights at each stop x price per night
    for stop in stops:
        if not stop.hotel_id:
            continue
        hotel = db.query(Hotel).filter(Hotel.id == stop.hotel_id).first()
        if not hotel or not hotel.price_per_night:
            continue
        nights = 1
        if stop.start_date and stop.end_date:
            nights = max((stop.end_date - stop.start_date).days, 1)
        stay_cost = float(hotel.price_per_night) * nights
        categories["stay"] += stay_cost
        total += stay_cost


    daily_average = total / days
    
    return BudgetResponse(
        total=total,
        by_category=dict(categories),
        daily_average=round(daily_average, 2)
    )
