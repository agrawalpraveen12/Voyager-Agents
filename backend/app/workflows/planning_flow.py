"""LangGraph workflow for trip planning."""
from typing import Dict, Any, TypedDict, List
from typing_extensions import Annotated
from operator import add
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_community.utilities import WikipediaAPIWrapper
from tavily import TavilyClient

from app.agents import (
    research_agent,
    places_agent,
    weather_agent,
    transport_agent,
    hotels_agent,
    activities_agent,
    itinerary_agent
)
from app.config import get_settings

settings = get_settings()

# Initialize shared dependencies with Groq
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=settings.groq_api_key,
    temperature=0.7
)
tavily_client = TavilyClient(api_key=settings.tavily_api_key)
wikipedia = WikipediaAPIWrapper()

class TripPlannerState(TypedDict):
    """State for trip planning workflow."""
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget: int
    num_travelers: int
    interests: List[str]
    
    # Agent outputs
    destination_info: Dict[str, Any]
    destination_image: str
    places_info: List[Dict[str, Any]]
    flight_options: List[Dict[str, Any]]
    train_options: List[Dict[str, Any]]
    bus_options: List[Dict[str, Any]]
    hotel_options: List[Dict[str, Any]]
    activities: List[Dict[str, Any]]
    weather_info: Dict[str, Any]
    final_itinerary: str
    
    # Progress tracking
    current_step: Annotated[List[str], add]
    error_messages: Annotated[List[str], add]

async def _research_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await research_agent(state, llm, tavily_client, wikipedia)
    return {
        "destination_info": result.get("destination_info", {}),
        "destination_image": result.get("destination_image", ""),
        "current_step": ["research"]
    }

async def _places_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await places_agent(state, tavily_client)
    return {
        "places_info": result.get("places_info", []),
        "current_step": ["places"]
    }

async def _weather_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await weather_agent(state, tavily_client)
    return {
        "weather_info": result.get("weather_info", {}),
        "current_step": ["weather"]
    }

async def _transport_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await transport_agent(state, llm, tavily_client)
    return {
        "flight_options": result.get("flight_options", []),
        "train_options": result.get("train_options", []),
        "bus_options": result.get("bus_options", []),
        "current_step": ["transport"]
    }

async def _hotels_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await hotels_agent(state, llm, tavily_client)
    return {
        "hotel_options": result.get("hotel_options", []),
        "current_step": ["hotels"]
    }

async def _activities_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await activities_agent(state, tavily_client)
    return {
        "activities": result.get("activities", []),
        "current_step": ["activities"]
    }

async def _itinerary_node(state: TripPlannerState) -> Dict[str, Any]:
    result = await itinerary_agent(state, llm)
    return {
        "final_itinerary": result.get("final_itinerary", ""),
        "current_step": ["itinerary"]
    }

def create_planning_graph():
    """Create the trip planning LangGraph."""
    workflow = StateGraph(TripPlannerState)
    
    # Add nodes
    workflow.add_node("research", _research_node)
    workflow.add_node("places", _places_node)
    workflow.add_node("weather", _weather_node)
    workflow.add_node("transport", _transport_node)
    workflow.add_node("hotels", _hotels_node)
    workflow.add_node("activities", _activities_node)
    workflow.add_node("itinerary", _itinerary_node)
    
    # Define edges
    workflow.set_entry_point("research")
    workflow.add_edge("research", "places")
    workflow.add_edge("places", "weather")
    workflow.add_edge("weather", "transport")
    workflow.add_edge("transport", "hotels")
    workflow.add_edge("hotels", "activities")
    workflow.add_edge("activities", "itinerary")
    workflow.add_edge("itinerary", END)
    
    return workflow.compile()
