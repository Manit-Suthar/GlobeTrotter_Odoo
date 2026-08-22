# AI Itinerary Generation Workflow

This document explains the two-phase AI architecture used in the GlobeTrotter application to securely and accurately generate user travel itineraries using Gemini and PostgreSQL.

## Overview

We use a **Two-Phase Generation Approach** to ensure that the AI hallucinates as little as possible and strictly maps its suggestions to real entities (Cities and Activities) that exist in our database. 

**Important Constraint:** Our current database only contains destinations within **India**. The AI prompts are strictly instructed to fallback or constrain travel routing to India.

---

## Phase 1: Intent Extraction
**Endpoint:** POST /api/ai/intent

When a user types in a messy, unstructured description of their dream trip, the frontend hits this endpoint.

**What it does:**
1. Uses gemini-3.6-flash to extract structured data (budget, pace, travel style, interests, constraints).
2. If the user didn't provide a 	itle, the AI generates a catchy one based on the description.
3. If exact dates are missing, the AI infers 	rip_duration_days from context clues (e.g. "for a week" -> 7).
4. Generates a high-level stimated_budget_range and a rough string array suggested_timeline.

**Output:** A structured JSON object (TripIntentResponse) that the frontend can use to populate forms and show the user a preview of what the AI understood.

---

## Phase 2: Database-Contextualized Itinerary Generation
**Endpoint:** POST /api/ai/generate-itinerary

Once the user confirms their intent, the frontend sends that validated intent data to this endpoint to get a day-by-day, fully mapped itinerary.

**What it does (No Guesswork):**
1. **Database Query:** The backend reads the requested destinations and searches the exact PostgreSQL cities table. It then pulls those city records along with their associated ctivities (hotels, sightseeing, etc.).
2. **Context Injection:** The backend packages this database dump (complete with real names, costs, and UUIDs) and injects it into Gemini's system prompt alongside the user's intent.
3. **Strict Mapping:** Gemini is prompted to generate the itinerary *only* using the provided Database UUIDs for cities and activities.
4. **Seamless Integration:** The endpoint returns a JSON payload (GenerateItineraryResponse) structured exactly like the ItineraryBulkUpdate schema. This means the frontend can render the itinerary, and when the user clicks "Save", the data is perfectly formatted to be inserted into our database tables (TripStop and TripActivity).

## Further Reading
See \ackend/app/ai/gemini_service.py\ to view the exact SQLAlchemy queries and System Prompts used for these two phases.
