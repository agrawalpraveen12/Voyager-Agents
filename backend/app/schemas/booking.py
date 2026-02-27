"""Pydantic models for booking and confirmation."""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ConfirmationRequest(BaseModel):
    """Request model for trip confirmation."""
    email: str
    phone: str
    trip_id: str


class ConfirmationResponse(BaseModel):
    """Response model for confirmation status."""
    trip_id: str
    status: str  # PENDING/CONFIRMED/CANCELLED/MODIFIED
    method: Optional[str] = None  # email/sms/phone
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class BookingReference(BaseModel):
    """Individual booking reference."""
    type: str  # flight/hotel/activity
    reference_number: str
    provider: str
    name: Optional[str] = None


class BookingResult(BaseModel):
    """Complete booking result."""
    trip_id: str
    status: str  # SUCCESS/FAILED/PARTIAL
    flight_reference: Optional[str] = None
    flight_provider: Optional[str] = None
    hotel_reference: Optional[str] = None
    hotel_provider: Optional[str] = None
    activity_references: List[BookingReference] = []
    booking_timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_cost: Optional[float] = None
