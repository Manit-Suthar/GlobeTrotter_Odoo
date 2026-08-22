# Product Requirements Document (PRD)

## 1. Problem Statement
Planning multi-city travel is complex, involving disconnected tools for managing destinations, activities, timelines, and budgets. GlobeTrotter solves this by providing a unified, relational platform to organize, visualize, and share personalized itineraries.

## 2. Target Users
- Travelers planning complex multi-destination trips.
- Budget-conscious planners needing cost breakdowns.
- Groups of friends looking to share read-only travel plans.

## 3. MVP Definition (End-to-End Journey)
The core MVP focuses on one complete flow:
Login → Dashboard → Create Trip → Add multiple cities/stops → Assign dates → Add activities → View itinerary → Calculate/view budget → Share itinerary → Open public read-only itinerary.

## 4. Feature Prioritization

### P0 (Required for Working Demo)
- Login / Signup (JWT Auth)
- Dashboard (List of recent trips, Create trip CTA)
- Create Trip (Basic metadata: name, dates)
- Multi-city Stops (Add, reorder stops within a trip)
- Dates & Timelines (Assigning dates to stops)
- Activities (Adding activities to specific stops)
- Itinerary View (Viewing the combined timeline)
- Budget Calculation (Basic summation of transport, stay, activities, meals)
- Public Sharing (Read-only shareable link generation)

### P1 (Important if Time Permits)
- City Search (Structured search of cities)
- Activity Search (Structured search of activities per city)
- Calendar / List Toggle in Itinerary View
- Friend Sharing (Targeted user-to-user sharing)
- User Profile / Settings

### P2 (Stretch Goals)
- AI-Powered Trip Suggestions (via Gemini)
- Advanced Recommendation Logic
- Advanced Calendar Interactions (Drag-to-reorder)
- Social Sharing Enhancements

### P3 (Skip for Hackathon)
- Admin / Analytics Dashboard

## 5. Acceptance Criteria (MVP)
- A user can register and log in securely.
- A user can create a new trip with a start and end date.
- A user can add at least 2 distinct cities (stops) to the trip.
- A user can assign specific days and activities to those stops.
- The system correctly calculates the estimated total budget based on the stops and activities.
- A user can generate a public link that allows an unauthenticated user to view the itinerary without edit privileges.
