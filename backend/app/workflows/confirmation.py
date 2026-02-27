from typing import Dict, Any
from app.config import get_settings
from app.services import (
    get_email_service,
    get_sms_service,
    get_whatsapp_service,
    get_redis_client,
    get_voice_service,
    get_booking_service
)
from app.workflows.booking_flow import create_booking_graph

settings = get_settings()

class ConfirmationWorkflow:
    """Manages the multi-channel confirmation and booking flow."""
    
    def __init__(self):
        self.email_service = get_email_service()
        self.sms_service = get_sms_service()
        self.whatsapp_service = get_whatsapp_service()
        self.voice_service = get_voice_service()
        self.redis_client = get_redis_client()
        self.booking_workflow = create_booking_graph()

    async def send_initial_confirmation(
        self,
        trip_id: str,
        trip_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send confirmation requests via Email (with PDF) and WhatsApp.
        """
        from app.utils.pdf_generator import generate_pdf
        import base64

        email = trip_data.get("email")
        phone = trip_data.get("phone")
        
        results = {
            "email_sent": False,
            "whatsapp_sent": False
        }

        # Generate PDF for attachment
        pdf_base64 = None
        try:
            itinerary_text = trip_data.get("final_itinerary", "")
            destination = trip_data.get("destination", "Trip")
            pdf_buffer = generate_pdf(itinerary_text, destination, trip_data)
            pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
            print(f"📄 Generated PDF for trip {trip_id}")
        except Exception as e:
            print(f"❌ Failed to generate PDF for initial email: {str(e)}")

        # 1. Send Email (Full Plan + PDF Attachment)
        if settings.enable_email_notifications and email:
            print(f"📧 Attempting to send email with PDF to {email}...")
            email_result = await self.email_service.send_trip_plan_email(
                email=email,
                trip_plan=trip_data,
                trip_id=trip_id,
                pdf_base64=pdf_base64
            )
            results["email_sent"] = email_result.get("success", False)
            print(f"📧 Email status: {'Success' if results['email_sent'] else 'Failed'}")

        # 2. Send WhatsApp (Summary + Confirmation Request)
        if settings.enable_whatsapp_confirmation and phone:
            print(f"💬 Attempting to send detailed WhatsApp to {phone}...")
            whatsapp_result = await self.whatsapp_service.send_trip_summary_whatsapp(phone, trip_data, trip_id)
            results["whatsapp_sent"] = whatsapp_result.get("success", False)
            print(f"💬 WhatsApp summary status: {'Success' if results['whatsapp_sent'] else 'Failed'}")
            
        return results

    async def process_confirmation(
        self,
        trip_id: str,
        action: str,
        method: str
    ) -> Dict[str, Any]:
        """
        Process user confirmation and trigger booking if confirmed.
        """
        print(f"🔄 Processing {action} via {method} for trip {trip_id}")
        
        trip_data = await self.redis_client.get_trip_state(trip_id)
        if not trip_data:
            print(f"⚠️ Trip {trip_id} not found in Redis")
            return {"success": False, "error": "Trip not found"}

        if action == "CONFIRM":
            print(f"✅ Trip {trip_id} CONFIRMED! Launching booking flow...")
            
            # Execute booking workflow
            result = await self.booking_workflow.ainvoke({
                "trip_id": trip_id,
                "trip_data": trip_data,
                "status": "confirmed"
            })
            
            # Update trip status in Redis
            trip_data["status"] = "completed"
            trip_data["booking_result"] = result.get("booking_result")
            await self.redis_client.set_trip_state(trip_id, trip_data)
            
            # Final notifications are handled inside booking_flow notify node
            return {"success": True, "status": "completed", "booking": result.get("booking_result")}
            
        elif action == "CANCEL":
            print(f"❌ Trip {trip_id} CANCELLED.")
            trip_data["status"] = "cancelled"
            await self.redis_client.set_trip_state(trip_id, trip_data)
            
            # Notify cancellation
            phone = trip_data.get("phone")
            email = trip_data.get("email")
            if phone: await self.whatsapp_service.send_cancellation_whatsapp(phone, trip_data.get("destination"))
            if email: await self.email_service.send_cancellation_email(email, trip_data, trip_id)
            
            return {"success": True, "status": "cancelled"}

        return {"success": False, "error": f"Invalid action: {action}"}


def get_confirmation_workflow() -> ConfirmationWorkflow:
    """Get confirmation workflow instance."""
    return ConfirmationWorkflow()
