"""Weather agent for fetching weather information."""
from typing import Dict, Any
from tavily import TavilyClient


async def weather_agent(
    state: Dict[str, Any],
    tavily_client: TavilyClient
) -> Dict[str, Any]:
    """Agent to fetch weather info using Tavily."""
    try:
        destination = state["destination"]
        
        # Search with Tavily for weather information
        weather_query = f"current weather and climate in {destination}"
        weather_result = tavily_client.search(
            query=weather_query,
            search_depth="basic",
            max_results=3
        )
        
        # Extract weather information
        results = weather_result.get("results", [])
        forecast = results[0].get("content", "Weather data unavailable") if results else "Weather data unavailable"
        
        weather_info = {
            "forecast": forecast,
            "temperature": "20-25°C",  # mock default
            "conditions": "Partly cloudy with occasional sunshine"
        }
        
        return {
            "weather_info": weather_info,
            "current_step": ["weather_complete"],
            "progress": 50
        }
    
    except Exception as e:
        return {
            "weather_info": {},
            "error_messages": [f"Weather error: {str(e)}"]
        }
