"""Email service for sending trip confirmations via Resend API."""
import base64
from io import BytesIO
from typing import Dict, Any, Optional
import qrcode
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
import resend

from app.config import get_settings

settings = get_settings()

class EmailService:
    """Service for handling all email communications."""
    
    def __init__(self):
        """Initialize the email service with Resend client."""
        # Note: resend library uses module-level api_key
        resend.api_key = settings.resend_api_key
        template_dir = Path(__file__).parent.parent / "templates"
        self.template_env = Environment(loader=FileSystemLoader(str(template_dir)))
    
    async def send_trip_plan_email(
        self,
        email: str,
        trip_plan: Dict[str, Any],
        trip_id: str,
        pdf_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send trip plan email with confirmation link.
        """
        # Generate QR code for mobile confirmation
        qr_code_base64 = self._generate_qr_code(trip_id)
        
        # Render HTML template
        template = self.template_env.get_template("trip_plan_email.html")
        html_content = template.render(
            trip=trip_plan,
            trip_id=trip_id,
            confirmation_url=f"{settings.frontend_url}/confirm/{trip_id}",
            qr_code=qr_code_base64,
            destination=trip_plan.get("destination", "your destination")
        )
        
        # Prepare email payload
        email_data = {
            "from": settings.from_email,
            "to": [email],
            "subject": f"🌍 Your Trip to {trip_plan.get('destination', 'Destination')} is Ready!",
            "html": html_content
        }
        
        # Add PDF attachment if provided
        if pdf_base64:
            email_data["attachments"] = [{
                "filename": f"{trip_plan.get('destination', 'trip').replace(' ', '_')}_itinerary.pdf",
                "content": pdf_base64
            }]
        
        # Send email
        try:
            print(f"📧 Sending email via Resend to: {email} (From: {settings.from_email})")
            # Correct Resend SDK usage: resend.Emails.send
            params: resend.Emails.SendParams = email_data
            response = resend.Emails.send(params)
            print(f"📧 Resend success: {response}")
            return {"success": True, "email_id": response.get("id"), "error": None}
        except Exception as e:
            print(f"❌ Resend failure: {str(e)}")
            return {"success": False, "email_id": None, "error": str(e)}
    
    async def send_booking_confirmation(
        self,
        email: str,
        booking_result: Dict[str, Any],
        trip_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send booking confirmation email with reference numbers.
        """
        template = self.template_env.get_template("booking_confirmation_email.html")
        html_content = template.render(
            trip=trip_plan,
            booking=booking_result,
            destination=trip_plan.get("destination", "your destination")
        )
        
        email_data = {
            "from": settings.from_email,
            "to": [email],
            "subject": f"✅ Booking Confirmed: {trip_plan.get('destination', 'Your Trip')}",
            "html": html_content
        }
        
        try:
            params: resend.Emails.SendParams = email_data
            response = resend.Emails.send(params)
            return {"success": True, "email_id": response.get("id"), "error": None}
        except Exception as e:
            return {"success": False, "email_id": None, "error": str(e)}
    
    async def send_cancellation_email(
        self,
        email: str,
        trip_plan: Dict[str, Any],
        trip_id: str
    ) -> Dict[str, Any]:
        """
        Send cancellation confirmation email.
        """
        template = self.template_env.get_template("cancellation_email.html")
        html_content = template.render(
            trip=trip_plan,
            trip_id=trip_id,
            modify_url=f"{settings.frontend_url}/modify/{trip_id}",
            destination=trip_plan.get("destination", "your destination")
        )
        
        email_data = {
            "from": settings.from_email,
            "to": [email],
            "subject": f"Trip Cancelled: {trip_plan.get('destination', 'Your Trip')}",
            "html": html_content
        }
        
        try:
            params: resend.Emails.SendParams = email_data
            response = resend.Emails.send(params)
            return {"success": True, "email_id": response.get("id"), "error": None}
        except Exception as e:
            return {"success": False, "email_id": None, "error": str(e)}
    
    def _generate_qr_code(self, trip_id: str) -> str:
        """
        Generate QR code for trip confirmation.
        
        Args:
            trip_id: Trip identifier to encode
            
        Returns:
            Base64-encoded QR code image
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4
        )
        qr.add_data(f"{settings.frontend_url}/confirm/{trip_id}")
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode()


# Global service instance
_email_service = None


def get_email_service() -> EmailService:
    """Get or create email service instance."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
