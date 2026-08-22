from pydantic import BaseModel

class TripSuggestionRequest(BaseModel):
    prompt: str

class TripSuggestionResponse(BaseModel):
    suggestions: str # This can be expanded into a structured JSON payload by Kalp
