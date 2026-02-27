"""Pydantic models for API responses."""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class PlaceInfo(BaseModel):
    """Information about a place."""
    name: str
    rating: Optional[float] = None
    address: str = ""
    types: List[str] = []
    place_id: Optional[str] = None
    image_url: Optional[str] = None


class FlightOption(BaseModel):
    """Flight option information."""
    airline: str
    price: str
    duration: str
    stops: str
    departure: str = ""
    booking_tip: str = ""


class HotelOption(BaseModel):
    """Hotel option information."""
    name: str
    price_per_night: str
    rating: str
    location: str
    amenities: str
    booking_platform: str = ""


class ActivityInfo(BaseModel):
    """Activity information."""
    title: str
    description: str
    category: str
    url: str = ""
    image_url: Optional[str] = None


class WeatherInfo(BaseModel):
    """Weather information."""
    forecast: str
    temperature: str = ""
    conditions: str = ""


class TripPlanResponse(BaseModel):
    """Response model for trip planning."""
    
    trip_id: str = Field(..., description="Unique trip identifier")
    status: str = Field(..., description="Status of the trip plan generation")
    origin: str  # Added origin field
    destination: str
    start_date: str
    end_date: str
    budget: int
    num_travelers: int
    interests: List[str]
    
    # Agent results
    destination_info: Dict[str, Any] = {}
    destination_image: Optional[str] = None
    places_info: List[PlaceInfo] = []
    flight_options: List[FlightOption] = []
    hotel_options: List[HotelOption] = []
    activities: List[ActivityInfo] = []
    weather_info: Optional[WeatherInfo] = None
    final_itinerary: str = ""
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    progress: int = 0
    error_messages: List[str] = []
    
    class Config:
        json_schema_extra = {
            "example": {
                "trip_id": "trip_123456",
                "status": "completed",
                "origin": "London, UK",
                "destination": "Paris, France",
                "start_date": "2024-06-01",
                "end_date": "2024-06-07",
                "budget": 4000,
                "num_travelers": 2,
                "interests": ["Culture", "Art", "Food"],
                "progress": 100,
                "final_itinerary": "# Trip to Paris...",
                "error_messages": []
            }
        }


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
