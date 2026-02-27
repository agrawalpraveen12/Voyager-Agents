"""WhatsApp service for confirmations via Twilio WhatsApp API."""
from typing import Dict, Any, List, Optional
from twilio.rest import Client
from app.config import get_settings

settings = get_settings()

class WhatsAppService:
    """Service for handling WhatsApp communications via Twilio."""
    
    def __init__(self):
        """Initialize Twilio client."""
        self.client = Client(
            settings.twilio_account_sid,
            settings.twilio_auth_token
        )
        self.from_number = settings.twilio_whatsapp_number
        if not self.from_number.startswith("whatsapp:"):
            self.from_number = f"whatsapp:{self.from_number}"
    
    async def send_trip_summary_whatsapp(self, phone: str, trip_plan: Dict[str, Any], trip_id: str):
        """
        Send a non-template rich summary with confirmation instruction.
        """
        destination = trip_plan.get("destination", "your destination")
        start_date = trip_plan.get("start_date", "N/A")
        end_date = trip_plan.get("end_date", "N/A")
        budget = trip_plan.get("budget", 0)
        
        # Get primary hotel if available
        hotels = trip_plan.get("hotel_options", [])
        hotel_name = hotels[0].get("name", "TBD") if hotels else "TBD"
        
        message_body = (
            f"🌟 *Your AI Trip Plan to {destination} is Ready!* 🌟\n\n"
            f"📅 *Dates:* {start_date} to {end_date}\n"
            f"🏨 *Hotel:* {hotel_name}\n"
            f"💰 *Budget:* ₹{budget}\n"
            f"👥 *Travelers:* {trip_plan.get('num_travelers', 1)}\n\n"
            f"📍 *Top Highlights:*\n"
        )
        
        # Add highlights
        for i, place in enumerate(trip_plan.get("places_info", [])[:3]):
            message_body += f"{i+1}. {place.get('name', 'Great Spot')}\n"
            
        message_body += (
            f"\n🚆 *Transport:* {len(trip_plan.get('flight_options', []))}✈️, {len(trip_plan.get('train_options', []))}🚆, {len(trip_plan.get('bus_options', []))}🚌 options found\n"
            f"🔗 *View Full Plan:* {settings.frontend_url}/trip/{trip_id}\n\n"
            f"✅ Reply *YES* to confirm and book!\n"
            f"❌ Reply *NO* to cancel.\n\n"
            f"☎️ Prefer a call? Click the 'Call Me' button on your dashboard!"
        )

        # Ensure phone number is in E.164 format for WhatsApp (strip spaces, add +)
        import re
        clean_phone = re.sub(r'\s+', '', phone.strip())
        
        if not clean_phone.startswith("+"):
            # If 10 digits starting with common Indian mobile digits, assume +91
            if len(clean_phone) == 10 and clean_phone[0] in "6789":
                clean_phone = f"+91{clean_phone}"
            else:
                clean_phone = f"+{clean_phone}"

        target_phone = f"whatsapp:{clean_phone}"
        
        try:
            print(f"💬 Sending WhatsApp summary to {clean_phone}...")
            message = self.client.messages.create(
                from_=self.from_number,
                to=target_phone,
                body=message_body
            )
            return {"success": True, "sid": message.sid}
        except Exception as e:
            print(f"❌ WhatsApp Error: {str(e)}")
            return {"success": False, "error": str(e)}

    async def send_booking_confirmation_whatsapp(
        self,
        phone: str,
        booking_result: Dict[str, Any],
        destination: str
    ) -> Dict[str, Any]:
        """Send final booking confirmation via WhatsApp."""
        target_phone = phone if phone.startswith("whatsapp:") else f"whatsapp:{phone}"
        message_body = f"""🎉 *Trip Confirmed!*

🌍 *Destination:* {destination}
✈️ *Flight Ref:* {booking_result.get('flight_reference', 'N/A')}
🏨 *Hotel Ref:* {booking_result.get('hotel_reference', 'N/A')}

A detailed itinerary PDF has been sent to your email. 

Have an amazing journey! ✈️🌍"""

        try:
            print(f"💬 Sending WhatsApp confirmation to {phone}...")
            message = self.client.messages.create(
                from_=self.from_number,
                to=target_phone,
                body=message_body
            )
            return {"success": True, "message_sid": message.sid}
        except Exception as e:
            print(f"❌ WhatsApp Confirmation Error: {str(e)}")
            return {"success": False, "error": str(e)}

    async def send_cancellation_whatsapp(self, phone: str, destination: str = "your trip"):
        """Send cancellation notification via WhatsApp."""
        target_phone = phone if phone.startswith("whatsapp:") else f"whatsapp:{phone}"
        message_body = f"""❌ *Trip Cancelled*

Your trip to {destination} has been cancelled. No charges have been made.

We hope to see you again soon!"""

        try:
            print(f"💬 Sending WhatsApp cancellation to {phone}...")
            self.client.messages.create(
                from_=self.from_number,
                to=target_phone,
                body=message_body
            )
        except Exception as e:
            print(f"❌ WhatsApp Cancellation Error: {str(e)}")

    async def handle_whatsapp_response(
        self,
        from_number: str,
        body: str
    ) -> Dict[str, str]:
        """Process user WhatsApp reply."""
        choice = body.strip().lower()
        clean_phone = from_number.replace("whatsapp:", "")
        
        if choice in ["1", "confirm", "yes", "✅ confirm"]:
            return {"action": "CONFIRM", "phone": clean_phone}
        elif choice in ["2", "cancel", "no", "❌ cancel"]:
            return {"action": "CANCEL", "phone": clean_phone}
        elif choice in ["3", "modify", "📝 modify"]:
            return {"action": "MODIFY", "phone": clean_phone}
        elif choice in ["4", "view", "📄 view full"]:
            return {"action": "VIEW", "phone": clean_phone}
        else:
            return {"action": "INVALID", "phone": clean_phone}

# Global service instance
_whatsapp_service = None

def get_whatsapp_service() -> WhatsAppService:
    """Get or create WhatsApp service instance."""
    global _whatsapp_service
    if _whatsapp_service is None:
        _whatsapp_service = WhatsAppService()
    return _whatsapp_service
