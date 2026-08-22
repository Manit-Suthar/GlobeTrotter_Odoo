# System Architecture

## Overview
GlobeTrotter follows a modular monolith architecture. It is separated into a React Single-Page Application (SPA) on the frontend and a FastAPI REST backend, communicating via JSON over HTTP.

## Architecture Diagram

```
[ React Frontend (Vite, TS, Tailwind) ]
       |
       | REST / JSON
       v
[ FastAPI Backend (Python) ]
       |
       +---- Authentication (JWT)
       |
       +---- Trip Management
       |
       +---- Itinerary Management
       |
       +---- Search (City / Activity)
       |
       +---- Budget Calculation
       |
       +---- Sharing (Tokens)
       |
       +---- AI Service (Gemini SDK - Isolated)
       |
       v
[ SQLAlchemy ORM ]
       |
       v
[ PostgreSQL Database ]
```

## Boundaries & Principles
1. **Frontend / Backend Split**: The frontend handles only UI, routing, and state. All business logic, cost calculations, and data validations happen on the backend.
2. **Database Access**: The frontend NEVER connects to PostgreSQL. Database queries are restricted to backend repositories/services. Route handlers (`api/routes`) should delegate complex queries to services/repositories.
3. **No Microservices**: The backend is a single FastAPI application organized into logical modules.
4. **Authentication**: Handled via JWT stored in HTTP-only cookies (or secure headers if cross-domain in dev).

## AI Service Boundary (Gemini)
Gemini is treated as an optional enhancement.
- The core trip functionality must work without AI.
- AI logic is isolated in `backend/app/services/ai/gemini_service.py`.
- The FastAPI backend securely holds the `GEMINI_API_KEY` in environment variables.
- The frontend requests suggestions via a dedicated API (e.g., `POST /api/ai/trip-suggestions`) and the backend returns structured JSON.

## Folder Responsibilities (Backend)
- `api/routes/`: FastAPI route definitions and basic HTTP request/response validation.
- `core/`: Config (Pydantic Settings), security (password hashing, JWT creation).
- `db/`: Database engine setup, session management.
- `models/`: SQLAlchemy ORM definitions.
- `schemas/`: Pydantic models for API request/response validation.
- `services/`: Business logic, budget calculations, orchestrating database calls.
- `repositories/`: (Optional but recommended) Reusable database query functions.
- `ai/`: Third-party AI integration.
