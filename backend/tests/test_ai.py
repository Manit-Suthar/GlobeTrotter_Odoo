import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.schemas.ai import TripIntentRequest, TripIntentResponse
from app.ai import gemini_service
from app.api.deps import get_current_user
from app.models.user import User

client = TestClient(app)

# Mock authenticated user for testing
def mock_get_current_user():
    return User(id="test-user-id", email="test@example.com", name="Test User")

app.dependency_overrides[get_current_user] = mock_get_current_user


def test_calculate_duration():
    assert gemini_service._calculate_duration("2026-10-01", "2026-10-08") == 8
    assert gemini_service._calculate_duration("2026-10-01", "2026-10-01") == 1
    assert gemini_service._calculate_duration(None, "2026-10-08") is None
    assert gemini_service._calculate_duration("invalid", "2026-10-08") is None


def test_parse_trip_intent_missing_api_key(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    request = TripIntentRequest(
        title="Test Trip",
        start_date="2026-10-01",
        end_date="2026-10-05",
        description="Testing missing API key"
    )
    with pytest.raises(Exception) as exc_info:
        gemini_service.parse_trip_intent(request)
    assert exc_info.value.status_code == 503
    assert "Gemini API key is not configured" in exc_info.value.detail


def test_parse_trip_intent_success(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "fake-api-key")

    mock_gemini_json = json.dumps({
        "travel_interests": ["heritage", "food"],
        "preferred_travel_style": "budget",
        "pace": "slow",
        "budget_preference": "INR 30,000",
        "destinations": ["Jaipur", "Udaipur"],
        "additional_constraints": ["vegetarian food only"],
        "summary": "A budget historical and foodie trip to Jaipur and Udaipur at a slow pace."
    })

    mock_response = MagicMock()
    mock_response.text = mock_gemini_json

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch("google.genai.Client", return_value=mock_client):
        request = TripIntentRequest(
            title="Backpacking Rajasthan",
            start_date="2026-10-01",
            end_date="2026-10-08",
            description="Budget trip to Jaipur and Udaipur focusing on heritage and vegetarian food."
        )
        result = gemini_service.parse_trip_intent(request)

        assert isinstance(result, TripIntentResponse)
        assert result.title == "Backpacking Rajasthan"
        assert result.trip_duration_days == 8
        assert result.travel_interests == ["heritage", "food"]
        assert result.preferred_travel_style == "budget"
        assert result.pace == "slow"
        assert result.destinations == ["Jaipur", "Udaipur"]
        assert result.additional_constraints == ["vegetarian food only"]


def test_api_endpoint_missing_key(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    payload = {
        "title": "Kerala Backwaters",
        "description": "Relaxing trip"
    }
    response = client.post("/api/ai/intent", json=payload)
    assert response.status_code == 503
    assert "Gemini API key is not configured" in response.json()["detail"]


def test_api_endpoint_success(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "fake-api-key")

    mock_gemini_json = json.dumps({
        "travel_interests": ["nature", "relaxation"],
        "preferred_travel_style": "relaxed",
        "pace": "slow",
        "budget_preference": "mid-range",
        "destinations": ["Alleppey", "Munnar"],
        "additional_constraints": [],
        "summary": "Relaxing nature trip to Kerala backwaters."
    })

    mock_response = MagicMock()
    mock_response.text = mock_gemini_json

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch("google.genai.Client", return_value=mock_client):
        payload = {
            "title": "Kerala Trip",
            "start_date": "2026-11-10",
            "end_date": "2026-11-15",
            "description": "Relaxing nature trip in Alleppey and Munnar."
        }
        response = client.post("/api/ai/intent", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Kerala Trip"
        assert data["trip_duration_days"] == 6
        assert "nature" in data["travel_interests"]
        assert data["destinations"] == ["Alleppey", "Munnar"]
