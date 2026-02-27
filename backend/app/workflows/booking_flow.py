"""LangGraph workflow for booking execution."""
from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from app.services import get_booking_service, get_email_service, get_whatsapp_service

class BookingState(TypedDict):
    """State for booking execution workflow."""
    trip_id: str
    trip_data: Dict[str, Any]
    booking_result: Dict[str, Any]
    status: str

async def _execute_mock_booking(state: BookingState) -> Dict[str, Any]:
    booking_service = get_booking_service()
    result = await booking_service.execute_booking(state["trip_data"])
    return {"booking_result": result, "status": "booked"}

async def _notify_success(state: BookingState) -> Dict[str, Any]:
    whatsapp_service = get_whatsapp_service()
    email_service = get_email_service()
    
    trip_data = state["trip_data"]
    booking_result = state["booking_result"]
    phone = trip_data.get("phone")
    email = trip_data.get("email")
    
    if phone:
        await whatsapp_service.send_booking_confirmation_whatsapp(
            phone, 
            booking_result, 
            trip_data.get("destination", "your destination")
        )
    
    if email:
        await email_service.send_booking_confirmation(email, booking_result, trip_data)
        
    return {"status": "notified"}

def create_booking_graph():
    """Create the booking execution LangGraph."""
    workflow = StateGraph(BookingState)
    
    workflow.add_node("book", _execute_mock_booking)
    workflow.add_node("notify", _notify_success)
    
    workflow.set_entry_point("book")
    workflow.add_edge("book", "notify")
    workflow.add_edge("notify", END)
    
    return workflow.compile()
