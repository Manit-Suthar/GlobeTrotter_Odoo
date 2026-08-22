# Data Model

## Database Requirements
- PostgreSQL Database
- SQLAlchemy ORM
- Alembic for Migrations

## Core Entities

### User
- `id`: UUID (PK)
- `email`: String (Unique)
- `hashed_password`: String
- `name`: String
- `created_at`: DateTime
- `updated_at`: DateTime

### Trip
- `id`: UUID (PK)
- `user_id`: UUID (FK to User)
- `name`: String
- `description`: Text (Optional)
- `start_date`: Date
- `end_date`: Date
- `cover_photo`: String (URL, optional)
- `created_at`: DateTime
- `updated_at`: DateTime
- *Relationships*: stops, expenses, shares

### City
- `id`: UUID (PK)
- `name`: String
- `country`: String
- `latitude`: Float
- `longitude`: Float
- `cost_index`: Float (Optional, for general budget estimates)
- `popularity`: Integer (Optional, for sorting)

### TripStop
- `id`: UUID (PK)
- `trip_id`: UUID (FK to Trip)
- `city_id`: UUID (FK to City)
- `order_index`: Integer (for reordering stops)
- `start_date`: Date
- `end_date`: Date
- *Relationships*: activities

### Activity
- `id`: UUID (PK)
- `city_id`: UUID (FK to City)
- `name`: String
- `description`: Text
- `category`: String (e.g., sightseeing, food, adventure)
- `default_cost`: Float (Estimated default cost)
- `default_duration_minutes`: Integer

### TripActivity
- `id`: UUID (PK)
- `trip_stop_id`: UUID (FK to TripStop)
- `activity_id`: UUID (FK to Activity) (Optional, user might add custom activity)
- `custom_name`: String (If `activity_id` is null)
- `scheduled_time`: DateTime
- `cost_estimate`: Float (Overrides default_cost)
- `notes`: Text

### Expense
- `id`: UUID (PK)
- `trip_id`: UUID (FK to Trip)
- `category`: Enum (transport, stay, activities, meals)
- `amount`: Float
- `currency`: String
- `description`: String
- `date`: Date (Optional)

### TripShare
- `id`: UUID (PK)
- `trip_id`: UUID (FK to Trip)
- `share_token`: String (Unique, Indexed)
- `created_at`: DateTime
- `expires_at`: DateTime (Optional)

## Budget Model
The budget calculation dynamically sums the `Expense` table records related to a `Trip`, plus the `cost_estimate` values from `TripActivity` if they represent expenses not already logged in the `Expense` table (implementation detail). 
MVP strategy: Pre-calculate per-category totals and average cost per day dynamically via an API endpoint.

## Sharing Model
- MVP: When a user clicks "Share Publicly", the system inserts a record into `TripShare` with a random `share_token`.
- Unauthenticated users can request `GET /api/public/trips/{share_token}` which will join `TripShare` -> `Trip` -> `TripStop` -> `TripActivity` to return a read-only payload.
