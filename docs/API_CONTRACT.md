# API Contract

*All endpoints generally return JSON and consume JSON.*
*Base path: `/api`*

## AUTH
### `POST /api/auth/register`
- **Body**: `{ "email": "...", "password": "...", "name": "..." }`
- **Response**: `201 Created` - `{ "id": "...", "email": "...", "name": "..." }`

### `POST /api/auth/login`
- **Body**: Form data or JSON (OAuth2 compatible password flow)
- **Response**: `200 OK` - `{ "access_token": "...", "token_type": "bearer" }`

### `POST /api/auth/logout`
- **Auth**: Required
- **Response**: `200 OK` (Clears token/cookie)

### `GET /api/auth/me`
- **Auth**: Required
- **Response**: `200 OK` - User object

---
## TRIPS
### `GET /api/trips`
- **Auth**: Required
- **Response**: `200 OK` - Array of Trip summary objects

### `POST /api/trips`
- **Auth**: Required
- **Body**: `{ "name": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "description": "..." }`
- **Response**: `201 Created` - Trip object

### `GET /api/trips/{trip_id}`
- **Auth**: Required (must own trip)
- **Response**: `200 OK` - Full Trip object with nested stops

### `PATCH /api/trips/{trip_id}`
- **Auth**: Required
- **Body**: Partial Trip object
- **Response**: `200 OK` - Updated Trip object

### `DELETE /api/trips/{trip_id}`
- **Auth**: Required
- **Response**: `204 No Content`

---
## STOPS
### `POST /api/trips/{trip_id}/stops`
- **Auth**: Required
- **Body**: `{ "city_id": "...", "start_date": "...", "end_date": "..." }`
- **Response**: `201 Created` - TripStop object

### `PATCH /api/trips/{trip_id}/stops/{stop_id}`
- **Auth**: Required
- **Body**: Partial TripStop updates (dates, etc)
- **Response**: `200 OK`

### `DELETE /api/trips/{trip_id}/stops/{stop_id}`
- **Auth**: Required
- **Response**: `204 No Content`

### `PATCH /api/trips/{trip_id}/stops/reorder`
- **Auth**: Required
- **Body**: `{ "stops": [{"id": "...", "order_index": 1}, ...] }`
- **Response**: `200 OK`

---
## CITIES & ACTIVITIES
### `GET /api/cities`
- **Query**: `?search=...`
- **Response**: `200 OK` - Array of City objects

### `GET /api/cities/{city_id}/activities`
- **Response**: `200 OK` - Array of Activity objects

---
## TRIP ACTIVITIES
### `POST /api/stops/{stop_id}/activities`
- **Auth**: Required
- **Body**: `{ "activity_id": "...", "custom_name": "...", "scheduled_time": "...", "cost_estimate": 100 }`
- **Response**: `201 Created`

### `PATCH /api/stops/{stop_id}/activities/{trip_activity_id}`
- **Auth**: Required
- **Body**: Partial TripActivity updates

### `DELETE /api/stops/{stop_id}/activities/{trip_activity_id}`
- **Auth**: Required

---
## ITINERARY & BUDGET
### `GET /api/trips/{trip_id}/itinerary`
- **Auth**: Required
- **Response**: structured timeline combining stops and activities

### `GET /api/trips/{trip_id}/budget`
- **Auth**: Required
- **Response**: `{ "total": 1000, "by_category": { "transport": 200, "meals": 300, ... }, "daily_average": 200 }`

---
## SHARING
### `POST /api/trips/{trip_id}/share`
- **Auth**: Required
- **Response**: `200 OK` - `{ "share_token": "abc-123", "url": "..." }`

### `DELETE /api/trips/{trip_id}/share`
- **Auth**: Required
- **Response**: `204 No Content`

### `GET /api/public/trips/{share_token}`
- **Auth**: Not required
- **Response**: `200 OK` - Read-only full itinerary payload

---
## AI
### `POST /api/ai/trip-suggestions`
- **Auth**: Required
- **Body**: `{ "prompt": "Plan a 5 day trip to Japan under 80000" }`
- **Response**: `200 OK` - Structured suggestion payload
