"""Trip planner service with LangGraph workflow."""
import uuid
from typing import Dict, Any, TypedDict, List
from typing_extensions import Annotated
from operator import add
from datetime import datetime
from langchain_groq import ChatGroq

from langgraph.graph import StateGraph, END
from langchain_community.utilities import WikipediaAPIWrapper
from tavily import TavilyClient

from app.config import get_settings
from app.agents import (
    research_agent,
    places_agent,
    weather_agent,
    flights_agent,
    hotels_agent,
    activities_agent,
    itinerary_agent
)
from app.workflows.planning_flow import create_planning_graph, TripPlannerState
from app.services.redis_client import get_redis_client


settings = get_settings()


class TripPlannerService:
    """Service for managing trip planning workflows."""
    
    def __init__(self):
        """Initialize the trip planner service."""
        from app.config import get_settings
        settings = get_settings()
        
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=settings.groq_api_key,
            temperature=0.7
        )
        self.workflow = create_planning_graph()
        self.redis_client = get_redis_client()
    
    async def create_trip_plan(
        self,
        origin: str,
        destination: str,
        start_date: str,
        end_date: str,
        budget: int,
        num_travelers: int,
        interests: List[str]
    ) -> Dict[str, Any]:
        """Create a new trip plan."""
        trip_id = f"trip_{uuid.uuid4().hex[:12]}"
        
        # Initialize state
        initial_state = {
            "origin": origin,
            "destination": destination,
            "start_date": start_date,
            "end_date": end_date,
            "budget": budget,
            "num_travelers": num_travelers,
            "interests": interests,
            "destination_info": {},
            "destination_image": "",
            "places_info": [],
            "flight_options": [],
            "hotel_options": [],
            "activities": [],
            "weather_info": {},
            "final_itinerary": "",
            "current_step": ["starting"],
            "error_messages": []
        }
        
        # Store initial status in Redis
        await self.redis_client.set_trip_state(trip_id, {
            "trip_id": trip_id,
            "status": "processing",
            "created_at": datetime.utcnow().isoformat(),
            **initial_state
        })
        
        try:
            # Run workflow asynchronously
            final_state = await self.workflow.ainvoke(initial_state)
            
            # Update Redis with results
            result = {
                "trip_id": trip_id,
                "status": "completed",
                "created_at": datetime.utcnow().isoformat(), # We can keep original but isoformat is fine
                **final_state
            }
            await self.redis_client.set_trip_state(trip_id, result)
            
            return result
            
        except Exception as e:
            # Update failure status in Redis if possible
            existing = await self.redis_client.get_trip_state(trip_id) or {}
            existing["status"] = "failed"
            existing.setdefault("error_messages", []).append(str(e))
            await self.redis_client.set_trip_state(trip_id, existing)
            raise
    
    async def get_trip_status(self, trip_id: str) -> Dict[str, Any]:
        """Get trip plan status by ID from Redis."""
        return await self.redis_client.get_trip_state(trip_id)


# Global service instance
_trip_service = None


def get_trip_service() -> TripPlannerService:
    """Get or create trip planner service instance."""
    global _trip_service
    if _trip_service is None:
        _trip_service = TripPlannerService()
    return _trip_service
