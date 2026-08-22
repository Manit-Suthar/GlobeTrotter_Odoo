# GlobeTrotter (Odoo Hackathon)

A personalized multi-city travel planning application allowing users to organize itineraries, manage budgets, and share plans.

## Project Overview
This repository contains the foundational skeleton for the GlobeTrotter hackathon project. It is structured as a modular monolith with a React frontend and a FastAPI backend.

## MVP Scope
1. User Authentication (Login/Signup)
2. Dashboard
3. Trip Creation (Multi-city)
4. Itinerary Builder (Dates, Activities)
5. Budget Calculation
6. Public Read-only Sharing

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Python, FastAPI, SQLAlchemy, Alembic, Pydantic
- **Database**: PostgreSQL
- **AI (Optional/Future)**: Google Gemini API

## Architecture & Documentation
Please review the `docs/` folder before contributing:
- [Problem Statement Summary](docs/PS.md)
- [Product Requirements](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATA_MODEL.md)
- [API Contracts](docs/API_CONTRACT.md)
- [UI Guidelines](docs/UI_GUIDELINES.md)
- [AI Rules](docs/AI_RULES.md)

## Team Workflow
This repository uses a feature-branch workflow.
1. `main` is the stable integration branch. Do NOT commit directly to `main`.
2. Create feature branches: `feature/auth`, `feature/trip-management`, etc.
3. Open a Pull Request for review before merging to `main`.

## Local Setup

### 1. Database (PostgreSQL)
Ensure PostgreSQL is running locally. Create a database named `globetrotter`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your local DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## AI Coding Rules
If using an AI assistant, refer it to `docs/AI_RULES.md` before it generates code.
