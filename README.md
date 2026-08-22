# GlobeTrotter 🌍

**GlobeTrotter** is a personalized multi-city travel planning application that helps users easily organize their itineraries, manage travel budgets, and share their plans with others.

## Features
- **User Authentication**: Secure login and signup.
- **Dashboard**: A central hub for managing your trips.
- **Trip Creation**: Planning tools tailored for multi-city travel.
- **Itinerary Builder**: Manage dates, times, and specific activities.
- **Budgeting**: Keep track of trip expenses and budgets.
- **Sharing**: Generate public, read-only links to share itineraries with friends and family.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Python, FastAPI, SQLAlchemy, Alembic
- **Database**: PostgreSQL

## Getting Started

### Prerequisites
- PostgreSQL running locally

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the environment variables:
   ```bash
   cp .env.example .env
   # Update the DATABASE_URL in your .env file
   ```
5. Run migrations and start the server:
   ```bash
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
