"""Trip planning API router."""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Response
from fastapi.responses import StreamingResponse
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
import io
import base64
from datetime import date
import uuid

from app.models import TripPlanRequest, TripPlanResponse, HealthResponse
from app.services import get_trip_service, get_sms_service
from app.utils.pdf_generator import generate_pdf
from app.workflows.confirmation import get_confirmation_workflow, ConfirmationWorkflow
from app.services.redis_client import get_redis_client

router = APIRouter(prefix="/trip", tags=["Trip Planning"])


@router.post("/plan", response_model=Dict[str, Any])
async def plan_trip(
    request: TripPlanRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Create a new trip plan.
    
    This endpoint initiates the trip planning process using multiple AI agents.
    The process includes:
    - Destination research
    - Finding places and attractions
    - Weather information
    - Flight options
    - Hotel recommendations
    - Activity suggestions
    - Complete itinerary generation
    """
    trip_service = get_trip_service()
    
    try:
        # Create trip plan synchronously (could be made async with background tasks)
        result = await trip_service.create_trip_plan(
            origin=request.origin,
            destination=request.destination,
            start_date=request.start_date.strftime("%Y-%m-%d"),
            end_date=request.end_date.strftime("%Y-%m-%d"),
            budget=request.budget,
            num_travelers=request.num_travelers,
            interests=request.interests
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create trip plan: {str(e)}"
        )


class TripPlanWithConfirmationRequest(BaseModel):
    """Request model for trip planning with confirmation."""
    origin: str  # Added origin field
    destination: str
    start_date: date
    end_date: date
    budget: int
    num_travelers: int
    interests: list[str]
    email: EmailStr
    phone: str


@router.post("/plan-with-confirmation")
async def plan_trip_with_confirmation(
    request: TripPlanWithConfirmationRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a trip plan and send confirmation requests via multiple channels.
    """
    trip_id = f"trip_{uuid.uuid4().hex[:8]}"
    print(f"✨ Starting planning for trip {trip_id} to {request.destination}")
    
    # 1. Start Planning
    trip_service = get_trip_service()
    result = await trip_service.create_trip_plan(
        origin=request.origin,
        destination=request.destination,
        start_date=str(request.start_date),
        end_date=str(request.end_date),
        budget=request.budget,
        num_travelers=request.num_travelers,
        interests=request.interests
    )
    
    # 2. Store basic info + results in Redis
    redis_client = get_redis_client()
    trip_data = {
        **result,
        "email": request.email,
        "phone": request.phone,
        "status": "PENDING_CONFIRMATION"
    }
    await redis_client.set_trip_state(trip_id, trip_data)
    
    # Map phone for webhooks
    if request.phone:
        await redis_client.map_phone_to_trip(request.phone, trip_id)
        
    # 3. Trigger Confirmation Sequence
    workflow = ConfirmationWorkflow()
    confirmation_result = await workflow.send_initial_confirmation(trip_id, trip_data)
    
    return {
        "trip_id": trip_id,
        "status": "PENDING_CONFIRMATION",
        "confirmation_sent": confirmation_result,
        "destination": request.destination,
        "plan": result.get("final_itinerary")
    }

@router.get("/{trip_id}")
async def get_trip_details(trip_id: str):
    """Get trip plan and status from Redis."""
    redis_client = get_redis_client()
    trip_data = await redis_client.get_trip_state(trip_id)
    if not trip_data:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip_data

@router.get("/{trip_id}/pdf")
async def download_itinerary_pdf(trip_id: str):
    """Generate and return PDF itinerary."""
    redis_client = get_redis_client()
    trip_data = await redis_client.get_trip_state(trip_id)
    
    if not trip_data:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    try:
        # Generate PDF
        itinerary_text = trip_data.get("final_itinerary", "Itinerary not available")
        destination = trip_data.get("destination", "Destination")
        pdf_buffer = generate_pdf(itinerary_text, destination, trip_data)
        
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={destination.replace(' ', '_')}_Itinerary.pdf"
            }
        )
    except Exception as e:
        print(f"❌ PDF generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

# Removed call initiation endpoint

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0"
    )
