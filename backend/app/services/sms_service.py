"""SMS and Phone service for confirmations via Twilio."""
from typing import Dict, Any
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather

from app.config import get_settings

settings = get_settings()


class SMSService:
    """Service for handling SMS and phone confirmations via Twilio."""
    
    def __init__(self):
        """Initialize Twilio client."""
        self.client = Client(
            settings.twilio_account_sid,
            settings.twilio_auth_token
        )
        self.from_number = settings.twilio_phone_number
    
    async def send_confirmation_sms(
        self,
        phone: str,
        trip_id: str,
        destination: str
    ) -> Dict[str, Any]:
        """
        Send SMS with confirmation instructions.
        """
        message_body = f"""🌍 Your trip to {destination} is ready!

Trip ID: {trip_id}

Reply with:
1️⃣ to CONFIRM booking
2️⃣ to CANCEL
3️⃣ to MODIFY dates

Or check your email for more details.
"""
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=phone
            )
            return {
                "success": True,
                "message_sid": message.sid,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "message_sid": None,
                "error": str(e)
            }
    
    async def send_booking_confirmation_sms(
        self,
        phone: str,
        booking_reference: str,
        destination: str
    ) -> Dict[str, Any]:
        """
        Send SMS with booking confirmation.
        """
        message_body = f"""✅ Trip confirmed!

Destination: {destination}
Booking ref: {booking_reference}

Check your email for full details and booking references.

Have a great trip! 🌍✈️
"""
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=phone
            )
            return {
                "success": True,
                "message_sid": message.sid,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "message_sid": None,
                "error": str(e)
            }
    
    async def send_cancellation_sms(
        self,
        phone: str,
        destination: str
    ) -> Dict[str, Any]:
        """
        Send SMS confirming cancellation.
        """
        message_body = f"""❌ Trip cancelled

Your trip to {destination} has been cancelled.

No charges have been made.

We hope to help you plan your next trip soon!
"""
        
        try:
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=phone
            )
            return {
                "success": True,
                "message_sid": message.sid,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "message_sid": None,
                "error": str(e)
            }
    
    async def handle_sms_response(
        self,
        from_number: str,
        body: str
    ) -> Dict[str, str]:
        """
        Process user SMS reply.
        """
        choice = body.strip()
        
        if choice == "1":
            return {"action": "CONFIRM", "phone": from_number}
        elif choice == "2":
            return {"action": "CANCEL", "phone": from_number}
        elif choice == "3":
            return {"action": "MODIFY", "phone": from_number}
        else:
            # Invalid response - send help message
            await self.send_help_message(from_number)
            return {"action": "INVALID", "phone": from_number}
    
    async def send_help_message(self, phone: str) -> None:
        """Send help message for invalid responses."""
        help_text = """Invalid response.

Please reply with:
1 - Confirm booking
2 - Cancel trip
3 - Modify dates

Or check your email for more options.
"""
        try:
            self.client.messages.create(
                body=help_text,
                from_=self.from_number,
                to=phone
            )
        except Exception:
            pass  # Silently fail for help messages
    
    def generate_ivr_response(self, trip_id: str = None) -> str:
        """
        Generate TwiML for IVR phone call.
        """
        response = VoiceResponse()
        
        # Use backend URL for IVR response webhook
        action_url = f"{settings.backend_url}/api/v1/booking/ivr-response"
        if trip_id:
            action_url += f"?trip_id={trip_id}"
            
        gather = Gather(
            num_digits=1,
            action=action_url,
            method='POST',
            timeout=10
        )
        
        gather.say(
            "Thank you for calling AI Trip Planner. "
            "Your trip plan is ready. "
            "Press 1 to confirm your booking. "
            "Press 2 to cancel your trip. "
            "Press 3 to speak with an agent.",
            voice='alice',
            language='en-US'
        )
        
        response.append(gather)
        response.say("We didn't receive your input. Goodbye.", voice='alice')
        
        return str(response)
    
    def generate_ivr_confirmation_response(self, action: str) -> str:
        """
        Generate TwiML response after user input.
        """
        response = VoiceResponse()
        
        if action == "CONFIRM":
            response.say(
                "Your booking has been confirmed. "
                "You will receive a confirmation email shortly. "
                "Thank you for using AI Trip Planner. "
                "Have a wonderful trip!",
                voice='alice'
            )
        elif action == "CANCEL":
            response.say(
                "Your trip has been cancelled. "
                "No charges have been made. "
                "We hope to help you plan your next trip soon. "
                "Goodbye.",
                voice='alice'
            )
        elif action == "MODIFY":
            response.say(
                "Please check your email for a link to modify your trip dates. "
                "Or visit our website to make changes. "
                "Thank you.",
                voice='alice'
            )
        else:
            response.say(
                "Invalid input. Please try again or check your email. "
                "Goodbye.",
                voice='alice'
            )
        
        return str(response)

    async def make_confirmation_call(self, phone: str, trip_id: str) -> Dict[str, Any]:
        """
        Initiate an outbound IVR call to the user.
        """
        try:
            # Construct the callback URL for the initial greeting
            callback_url = f"{settings.backend_url}/api/v1/booking/ivr-greeting?trip_id={trip_id}"
            
            call = self.client.calls.create(
                to=phone,
                from_=self.from_number,
                url=callback_url
            )
            
            return {
                "success": True,
                "call_sid": call.sid,
                "message": "Call initiated successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Global service instance
_sms_service = None


def get_sms_service() -> SMSService:
    """Get or create SMS service instance."""
    global _sms_service
    if _sms_service is None:
        _sms_service = SMSService()
    return _sms_service
