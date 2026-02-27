from fastapi import APIRouter, Request, BackgroundTasks, HTTPException, Query, Form
from fastapi.responses import Response
from typing import Dict, Any
import logging

from app.services import (
    get_voice_service,
    get_whatsapp_service,
    get_redis_client,
    get_sms_service
)
from app.workflows.confirmation import ConfirmationWorkflow
from app.schemas.booking import ConfirmationResponse

router = APIRouter(prefix="/booking", tags=["booking"]) # Re-add prefix and tags
logger = logging.getLogger(__name__)

# Single instance of workflow
confirmation_workflow = ConfirmationWorkflow()

@router.post("/whatsapp-webhook")
async def whatsapp_webhook(request: Request):
    """Handle incoming WhatsApp messages from Twilio."""
    form_data = await request.form()
    from_number = form_data.get("From", "").replace("whatsapp:", "")
    body = form_data.get("Body", "").strip().upper()
    
    redis_client = get_redis_client()
    trip_id = await redis_client.get_trip_by_phone(from_number) # Use get_trip_by_phone as in original
    
    if not trip_id:
        logger.warning(f"WhatsApp from unknown sender: {from_number}. Body: {body}")
        # Optionally send a message back to the user
        whatsapp_service = get_whatsapp_service()
        await whatsapp_service.send_message(from_number, "Sorry, I couldn't find a trip associated with this number. Please ensure you are using the phone number linked to your booking.")
        return Response(content="<Response></Response>", media_type="application/xml")
        
    logger.info(f"WhatsApp message received for trip ID {trip_id} from {from_number}. Body: {body}")

    if "YES" in body or "CONFIRM" in body:
        await confirmation_workflow.process_confirmation(trip_id, "CONFIRM", "whatsapp")
        logger.info(f"Trip ID {trip_id} confirmed via WhatsApp.")
    elif "NO" in body or "CANCEL" in body:
        await confirmation_workflow.process_confirmation(trip_id, "CANCEL", "whatsapp")
        logger.info(f"Trip ID {trip_id} cancelled via WhatsApp.")
    else:
        # Handle other messages, e.g., send help or current status
        whatsapp_service = get_whatsapp_service()
        await whatsapp_service.send_help_message(from_number) # Assuming a help message function exists
        logger.info(f"Trip ID {trip_id}: Unrecognized WhatsApp message '{body}'. Sent help message.")
        
    return Response(content="<Response></Response>", media_type="application/xml")

# SMS webhook (retained and adapted from original, as it was not explicitly removed)
@router.post("/sms-webhook")
async def sms_webhook(
    From: str = Form(...),
    Body: str = Form(...)
) -> Response:
    """
    Twilio SMS webhook endpoint.
    
    Handles incoming SMS responses from users.
    """
    sms_service = get_sms_service() # Need to re-import get_sms_service
    redis_client = get_redis_client()
    
    logger.info(f"SMS received from {From} with body: {Body}")
    
    # Get trip ID from phone number
    trip_id = await redis_client.get_trip_by_phone(From)
    if not trip_id:
        await sms_service.send_help_message(From)
        logger.warning(f"SMS from unknown sender: {From}. Body: {Body}. Sent help message.")
        return Response(content="", media_type="text/plain")
    
    # Determine action based on body
    action = "INVALID"
    if "YES" in Body.upper() or "CONFIRM" in Body.upper():
        action = "CONFIRM"
    elif "NO" in Body.upper() or "CANCEL" in Body.upper():
        action = "CANCEL"
    
    if action != "INVALID":
        # Process confirmation
        await confirmation_workflow.process_confirmation(trip_id, action, "sms")
        logger.info(f"Trip ID {trip_id} {action.lower()}ed via SMS.")
    else:
        await sms_service.send_help_message(From)
        logger.info(f"Trip ID {trip_id}: Unrecognized SMS message '{Body}'. Sent help message.")
    
    return Response(content="", media_type="text/plain")

@router.post("/email-confirm/{trip_id}")
async def email_confirmation(
    trip_id: str,
    action: str = "confirm"
):
    """Handle confirmation clicks from email."""
    logger.info(f"📧 Email confirmation clicked for trip {trip_id}, action: {action}")
    
    action_upper = "CONFIRM" if action.lower() == "confirm" else "CANCEL"
    result = await confirmation_workflow.process_confirmation(trip_id, action_upper, "email")
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "Trip not found"))
    
    return {
        "trip_id": trip_id,
        "status": result.get("status"),
        "message": f"Trip {action_upper.lower()}ed successfully"
    }

@router.get("/status/{trip_id}", response_model=ConfirmationResponse)
async def get_confirmation_status(trip_id: str):
    """Get real-time tracking of trip confirmation status."""
    redis_client = get_redis_client()
    trip_data = await redis_client.get_trip_state(trip_id)
    
    if not trip_data:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    return ConfirmationResponse(
        trip_id=trip_id,
        status=trip_data.get("status", "PENDING"),
        method=trip_data.get("confirmation_method")
    )
