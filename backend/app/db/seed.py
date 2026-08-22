"""Database seed script for GlobeTrotter.

Loads rich Indian travel destination data from CSVs:
- 55+ Cities across India (Goa, Jaipur, Delhi, Udaipur, Manali, Rishikesh, Mumbai, Varanasi, etc.)
- 100+ Curated Activities & 300+ Sightseeing Attractions
- Demo User (demo@globetrotter.com)
- Sample Multi-City Trip ("Royal Golden Triangle: Delhi, Agra & Jaipur")
- Realistic Categorized Expenses (transport, stay, activities, meals)
- Public Shareable Itinerary Token
"""
import csv
import datetime
import os
import sys
from sqlalchemy.orm import Session

# Ensure app package is discoverable
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.database import SessionLocal, engine
from app.models.user import User
from app.models.city import City
from app.models.activity import Activity
from app.models.hotel import Hotel
from app.models.trip import Trip, TripStop, TripActivity, Expense, TripShare

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def parse_float(val: str, default: float = 0.0) -> float:
    try:
        return float(val.strip()) if val and val.strip() else default
    except (ValueError, TypeError):
        return default


def parse_int(val: str, default: int = 0) -> int:
    try:
        return int(float(val.strip())) if val and val.strip() else default
    except (ValueError, TypeError):
        return default


def seed_cities(db: Session) -> dict[str, City]:
    """Seed cities from cities.csv."""
    cities_file = os.path.join(DATA_DIR, "cities.csv")
    city_map: dict[str, City] = {}

    if not os.path.exists(cities_file):
        print(f"[!] Warning: {cities_file} not found.")
        return city_map

    print("--> Seeding Cities...")
    with open(cities_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            city_name = row["city"].strip()
            state = row.get("state", "").strip()
            tier = row.get("tier", "").strip()
            
            # Map tier to cost index
            tier_cost_map = {"Tier 1": 1.8, "Tier 2": 1.3, "Tier 3": 0.9}
            cost_index = tier_cost_map.get(tier, 1.0)
            
            pop_score = parse_int(row.get("popularity_score", "70"))
            if pop_score <= 10:
                popularity = pop_score * 10
            else:
                popularity = pop_score

            city = db.query(City).filter(City.name == city_name).first()
            if not city:
                city = City(
                    name=city_name,
                    state=state,
                    country="India",
                    latitude=parse_float(row.get("latitude")),
                    longitude=parse_float(row.get("longitude")),
                    cost_index=cost_index,
                    popularity=popularity,
                    image_url=row.get("image_url", "").strip(),
                    tourism_type=row.get("tourism_type", "").strip(),
                    best_season=row.get("best_season", "").strip(),
                )
                db.add(city)
                db.flush()
                print(f"  + City added: {city.name} ({city.state})")
            else:
                # Update metadata if missing
                if not city.image_url and row.get("image_url"):
                    city.image_url = row["image_url"].strip()
                if not city.state and state:
                    city.state = state
                if not city.tourism_type and row.get("tourism_type"):
                    city.tourism_type = row["tourism_type"].strip()
                if not city.best_season and row.get("best_season"):
                    city.best_season = row["best_season"].strip()

            city_map[city_name.lower()] = city

    db.commit()
    print(f"--> Total Cities Active: {len(city_map)}")
    return city_map


def seed_activities_and_places(db: Session, city_map: dict[str, City]) -> None:
    """Seed activities and places from CSVs."""
    print("--> Seeding Activities & Attractions...")
    activities_count = 0

    # 1. Ingest activities.csv
    act_file = os.path.join(DATA_DIR, "activities.csv")
    if os.path.exists(act_file):
        with open(act_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                city_name = row.get("city", "").strip().lower()
                city = city_map.get(city_name)
                if not city:
                    continue

                act_name = row["name"].strip()
                existing = db.query(Activity).filter(
                    Activity.city_id == city.id,
                    Activity.name == act_name
                ).first()

                if not existing:
                    duration_hrs = parse_float(row.get("duration_hours", "1.5"), 1.5)
                    activity = Activity(
                        city_id=city.id,
                        name=act_name,
                        description=f"{row.get('category', 'Activity').capitalize()} in {city.name}. Near {row.get('near_place_name', city.name)}.",
                        category=row.get("category", "sightseeing").strip().lower(),
                        default_cost=parse_float(row.get("price", "0")),
                        default_duration_minutes=int(duration_hrs * 60),
                        rating=parse_float(row.get("rating", "4.5"), 4.5),
                        image_url=row.get("image_url", "").strip(),
                        tags=row.get("tags", "").strip(),
                    )
                    db.add(activity)
                    activities_count += 1

    # 2. Ingest places.csv (as sightseeing / cultural activities)
    places_file = os.path.join(DATA_DIR, "places.csv")
    if os.path.exists(places_file):
        with open(places_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                city_name = row.get("city", "").strip().lower()
                city = city_map.get(city_name)
                if not city:
                    continue

                place_name = row["name"].strip()
                existing = db.query(Activity).filter(
                    Activity.city_id == city.id,
                    Activity.name == place_name
                ).first()

                if not existing:
                    duration_hrs = parse_float(row.get("duration_hours", "2.0"), 2.0)
                    category = row.get("category", "sightseeing").strip().lower()
                    if category in ["temple", "church", "fort", "palace", "heritage", "museum"]:
                        mapped_category = "culture"
                    elif category in ["beach", "lake", "nature"]:
                        mapped_category = "sightseeing"
                    elif category in ["market"]:
                        mapped_category = "shopping"
                    elif category in ["viewpoint"]:
                        mapped_category = "adventure"
                    else:
                        mapped_category = category

                    activity = Activity(
                        city_id=city.id,
                        name=place_name,
                        description=row.get("description", "").strip() or f"Explore {place_name} in {city.name}.",
                        category=mapped_category,
                        default_cost=parse_float(row.get("price_estimate", "0")),
                        default_duration_minutes=int(duration_hrs * 60),
                        rating=parse_float(row.get("rating", "4.6"), 4.6),
                        image_url=row.get("image_url", "").strip(),
                        tags=row.get("tags", "").strip(),
                    )
                    db.add(activity)
                    activities_count += 1

    db.commit()
    print(f"--> Ingested {activities_count} new activities/places successfully.")


def seed_hotels(db: Session, city_map: dict[str, City]) -> None:
    """Seed hotels from hotels.csv."""
    hotels_file = os.path.join(DATA_DIR, "hotels.csv")
    if not os.path.exists(hotels_file):
        print(f"[!] Warning: {hotels_file} not found.")
        return

    print("--> Seeding Hotels...")
    hotels_count = 0
    with open(hotels_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            city_name = row.get("city", "").strip().lower()
            city = city_map.get(city_name)
            if not city:
                continue

            hotel_name = row["name"].strip()
            existing = db.query(Hotel).filter(
                Hotel.city_id == city.id,
                Hotel.name == hotel_name
            ).first()

            if not existing:
                hotel = Hotel(
                    city_id=city.id,
                    name=hotel_name,
                    hotel_type=row.get("hotel_type", "").strip().lower(),
                    price_per_night=parse_float(row.get("price_per_night", "0")),
                    rating=parse_float(row.get("rating", "4.0"), 4.0),
                    latitude=parse_float(row.get("latitude")),
                    longitude=parse_float(row.get("longitude")),
                    budget_category=row.get("budget_category", "").strip().lower(),
                    nearby_area=row.get("nearby_area", "").strip(),
                    popularity_score=parse_int(row.get("popularity_score", "50")),
                    tags=row.get("tags", "").strip(),
                    image_url=row.get("image_url", "").strip(),
                )
                db.add(hotel)
                hotels_count += 1

    db.commit()
    print(f"--> Ingested {hotels_count} new hotels successfully.")


def seed_demo_user_and_trip(db: Session, city_map: dict[str, City]) -> None:
    """Seeds a demo traveler and an authentic multi-city trip with full itinerary & budget."""
    print("--> Seeding Demo User & Multi-City Itinerary...")

    # 1. Demo User
    demo_email = "demo@globetrotter.com"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        # Bcrypt hash for standard password: 'password123'
        hashed_pw = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W5650567890abcde"
        user = User(
            email=demo_email,
            name="Demo Traveler",
            hashed_password=hashed_pw,
        )
        db.add(user)
        db.flush()
        print(f"  + Created demo user: {user.email}")
    else:
        print(f"  . Demo user exists: {user.email}")

    # 2. Sample Trip: Golden Triangle (Delhi -> Agra -> Jaipur)
    trip_name = "Royal Golden Triangle: Delhi, Agra & Jaipur"
    trip = db.query(Trip).filter(Trip.user_id == user.id, Trip.name == trip_name).first()

    if not trip:
        start_date = datetime.date.today() + datetime.timedelta(days=20)
        end_date = start_date + datetime.timedelta(days=7)

        trip = Trip(
            user_id=user.id,
            name=trip_name,
            description="An unforgettable 7-day multi-city journey across Delhi, the iconic Taj Mahal in Agra, and royal palaces of Jaipur.",
            start_date=start_date,
            end_date=end_date,
            cover_photo="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Taj_Mahal%2C_Agra%2C_India.jpg/330px-Taj_Mahal%2C_Agra%2C_India.jpg",
        )
        db.add(trip)
        db.flush()
        print(f"  + Created sample multi-city trip: {trip.name}")

        # Stop 1: Delhi (Days 1 - 2)
        delhi = city_map.get("delhi")
        if delhi:
            stop1 = TripStop(
                trip_id=trip.id,
                city_id=delhi.id,
                order_index=1,
                start_date=start_date,
                end_date=start_date + datetime.timedelta(days=2),
            )
            db.add(stop1)
            db.flush()

            delhi_acts = db.query(Activity).filter(Activity.city_id == delhi.id).all()
            for idx, act in enumerate(delhi_acts[:3]):
                t_act = TripActivity(
                    trip_stop_id=stop1.id,
                    activity_id=act.id,
                    custom_name=act.name,
                    scheduled_time=datetime.datetime.combine(
                        start_date + datetime.timedelta(days=idx % 2),
                        datetime.time(10 + idx * 3, 0)
                    ),
                    cost_estimate=act.default_cost or 250.0,
                    notes="Morning sightseeing slot",
                    order_index=idx + 1,
                )
                db.add(t_act)

        # Stop 2: Agra (Days 3 - 4)
        agra = city_map.get("agra")
        if agra:
            stop2 = TripStop(
                trip_id=trip.id,
                city_id=agra.id,
                order_index=2,
                start_date=start_date + datetime.timedelta(days=2),
                end_date=start_date + datetime.timedelta(days=4),
            )
            db.add(stop2)
            db.flush()

            agra_acts = db.query(Activity).filter(Activity.city_id == agra.id).all()
            for idx, act in enumerate(agra_acts[:3]):
                t_act = TripActivity(
                    trip_stop_id=stop2.id,
                    activity_id=act.id,
                    custom_name=act.name,
                    scheduled_time=datetime.datetime.combine(
                        start_date + datetime.timedelta(days=2 + idx % 2),
                        datetime.time(6 + idx * 4, 0)
                    ),
                    cost_estimate=act.default_cost or 100.0,
                    notes="Sunrise & afternoon visits",
                    order_index=idx + 1,
                )
                db.add(t_act)

        # Stop 3: Jaipur (Days 5 - 7)
        jaipur = city_map.get("jaipur")
        if jaipur:
            stop3 = TripStop(
                trip_id=trip.id,
                city_id=jaipur.id,
                order_index=3,
                start_date=start_date + datetime.timedelta(days=4),
                end_date=end_date,
            )
            db.add(stop3)
            db.flush()

            jaipur_acts = db.query(Activity).filter(Activity.city_id == jaipur.id).all()
            for idx, act in enumerate(jaipur_acts[:3]):
                t_act = TripActivity(
                    trip_stop_id=stop3.id,
                    activity_id=act.id,
                    custom_name=act.name,
                    scheduled_time=datetime.datetime.combine(
                        start_date + datetime.timedelta(days=4 + idx % 3),
                        datetime.time(9 + idx * 3, 30)
                    ),
                    cost_estimate=act.default_cost or 300.0,
                    notes="Palace and fort guided tours",
                    order_index=idx + 1,
                )
                db.add(t_act)

        # Sample categorized expenses
        expenses_data = [
            {"category": "transport", "amount": 8500.0, "currency": "INR", "description": "Private Intercity AC Cab (Delhi -> Agra -> Jaipur)"},
            {"category": "stay", "amount": 11800.0, "currency": "INR", "description": "Heritage Boutique Hotel Delhi (2 nights)"},
            {"category": "stay", "amount": 6600.0, "currency": "INR", "description": "Taj View Hotel Agra (2 nights)"},
            {"category": "stay", "amount": 10800.0, "currency": "INR", "description": "Pink City Haveli Jaipur (3 nights)"},
            {"category": "meals", "amount": 6500.0, "currency": "INR", "description": "Estimated multi-city dining, street food & Rajasthani thalis"},
            {"category": "activities", "amount": 2850.0, "currency": "INR", "description": "Monument tickets, audio guides & local entry fees"},
        ]

        for exp in expenses_data:
            expense_obj = Expense(
                trip_id=trip.id,
                category=exp["category"],
                amount=exp["amount"],
                currency=exp["currency"],
                description=exp["description"],
                date=start_date,
            )
            db.add(expense_obj)

        # Share Token
        share = TripShare(
            trip_id=trip.id,
            share_token="golden-triangle-india-demo",
            share_type="public",
        )
        db.add(share)

        db.commit()
        print("  + Sample multi-city trip, stops, activities, expenses, and share token created!")
    else:
        print(f"  . Sample trip already exists: {trip.name}")


def run_seed() -> None:
    """Main seed runner function."""
    print("==================================================")
    print("  GlobeTrotter Database Seeding Pipeline")
    print("==================================================")
    db = SessionLocal()
    try:
        city_map = seed_cities(db)
        seed_activities_and_places(db, city_map)
        seed_hotels(db, city_map)
        seed_demo_user_and_trip(db, city_map)
        print("==================================================")
        print("  Database Seeding Completed Successfully!")
        print("==================================================")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
