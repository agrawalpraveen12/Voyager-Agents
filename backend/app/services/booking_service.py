import uuid
import logging
from typing import Dict, Any, List
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class BookingService:
    """Coordinates mock booking of trip components."""
    
    async def execute_booking(self, trip_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate booking flights, hotels, and activities.
        """
        print(f"🏨 Executing bookings for trip to {trip_plan.get('destination')}...")
        
        # Mock booking IDs
        booking_id = f"BK-{uuid.uuid4().hex[:8].upper()}"
        flight_ref = f"FL-{uuid.uuid4().hex[:6].upper()}"
        hotel_ref = f"HT-{uuid.uuid4().hex[:6].upper()}"
        
        # Collect activity refs
        activity_refs = []
        activities = trip_plan.get('activities', [])
        for i in range(min(3, len(activities))):
            activity_refs.append(f"ACT-{uuid.uuid4().hex[:4].upper()}")
            
        print(f"✅ Booking successful: {booking_id}")
        
        return {
            "success": True,
            "booking_id": booking_id,
            "flight_ref": flight_ref,
            "hotel_ref": hotel_ref,
            "activity_refs": activity_refs,
            "status": "booked"
        }

_booking_service = None

def get_booking_service():
    global _booking_service
    if _booking_service is None:
        _booking_service = BookingService()
    return _booking_service
