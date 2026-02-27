"""Pydantic models for API requests."""
from pydantic import BaseModel, Field, validator
from typing import List
from datetime import date


class TripPlanRequest(BaseModel):
    """Request model for trip planning."""
    
    origin: str = Field(
        ...,
        description="Starting city and country",
        example="London, UK"
    )
    destination: str = Field(
        ...,
        description="Destination city and country",
        example="Tokyo, Japan"
    )
    start_date: date = Field(
        ...,
        description="Trip start date",
        example="2024-06-01"
    )
    end_date: date = Field(
        ...,
        description="Trip end date",
        example="2024-06-07"
    )
    budget: int = Field(
        ...,
        ge=500,
        le=100000,
        description="Budget in USD",
        example=3000
    )
    num_travelers: int = Field(
        ...,
        ge=1,
        le=20,
        description="Number of travelers",
        example=2
    )
    interests: List[str] = Field(
        ...,
        description="List of interests",
        example=["Culture", "Food", "Local Experiences"]
    )
    
    @validator('end_date')
    def validate_dates(cls, v, values):
        """Validate that end_date is after start_date."""
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
    
    @validator('interests')
    def validate_interests(cls, v):
        """Validate that at least one interest is provided."""
        if not v or len(v) == 0:
            raise ValueError('At least one interest must be provided')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "origin": "London, UK",
                "destination": "Paris, France",
                "start_date": "2024-06-01",
                "end_date": "2024-06-07",
                "budget": 4000,
                "num_travelers": 2,
                "interests": ["Culture", "Art", "Food", "History"]
            }
        }
