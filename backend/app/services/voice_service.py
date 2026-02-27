from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
from app.config import get_settings
from app.services.redis_client import get_redis_client
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.client = Client(
            settings.twilio_account_sid,
            settings.twilio_auth_token
        )
        self.from_number = settings.twilio_phone_number
    
    async def initiate_confirmation_call(self, to_number: str, trip_id: str):
        """
        Make automated voice call for trip confirmation
        """
        try:
            # Initiate call
            call = self.client.calls.create(
                to=to_number,
                from_=self.from_number,
                url=f"{settings.backend_url}/api/v1/booking/ivr-greeting?trip_id={trip_id}",
                method='POST'
            )
            
            print(f"☎️ Voice call initiated to {to_number}, SID: {call.sid}")
            return call.sid
            
        except Exception as e:
            print(f"❌ Voice call error: {str(e)}")
            raise
    
    def generate_ivr_twiml(self, trip_data: dict, trip_id: str) -> str:
        """
        Generate TwiML for IVR phone call.
        """
        response = VoiceResponse()
        
        destination = trip_data.get("destination", "your destination")
        start_date = trip_data.get("start_date", "soon")
        
        response.say(
            f"Hello! This is AI Trip Planner calling about your {destination} trip starting on {start_date}.",
            voice='alice'
        )
        
        # Gather user input
        action_url = f"{settings.backend_url}/api/v1/booking/ivr-response?trip_id={trip_id}"
        gather = Gather(
            num_digits=1,
            action=action_url,
            method='POST',
            timeout=10
        )
        
        gather.say(
            "To CONFIRM this booking, press 1. "
            "To CANCEL this trip, press 2. "
            "To hear this again, press 9.",
            voice='alice'
        )
        
        response.append(gather)
        return str(response)

    def generate_confirmation_response(self, action: str) -> str:
        """Generate response based on user input"""
        response = VoiceResponse()
        
        if action == "CONFIRM":
            response.say(
                "Thank you! Your trip has been confirmed. "
                "You will receive details shortly via WhatsApp and email. "
                "Goodbye!",
                voice='alice'
            )
        elif action == "CANCEL":
            response.say(
                "Your trip has been cancelled as requested. "
                "No charges have been made. Goodbye!",
                voice='alice'
            )
        else:
            response.say(
                "I'm sorry, I didn't understand that. Please check your WhatsApp for other ways to confirm. Goodbye!",
                voice='alice'
            )
        
        return str(response)

_voice_service = None

def get_voice_service():
    global _voice_service
    if _voice_service is None:
        _voice_service = VoiceService()
    return _voice_service
