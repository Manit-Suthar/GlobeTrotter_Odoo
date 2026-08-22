import asyncio
from app.schemas.ai import TripIntentRequest
from app.ai.gemini_service import parse_trip_intent
import json

request = TripIntentRequest(
    title="Summer vacation in Japan",
    start_date="2024-07-01",
    end_date="2024-07-15",
    description="I want to visit Tokyo, Kyoto, and Osaka. I love food, history, and fast-paced travel. My budget is mid-range. No seafood."
)

try:
    response = parse_trip_intent(request)
    print("Success! Response:")
    print(response.model_dump_json(indent=2))
except Exception as e:
    print(f"Failed: {e}")
