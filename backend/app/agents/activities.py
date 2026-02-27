"""Activities agent for finding things to do."""
from typing import Dict, Any
from tavily import TavilyClient
from .research import get_wikipedia_image


async def activities_agent(
    state: Dict[str, Any],
    tavily_client: TavilyClient
) -> Dict[str, Any]:
    """Find activities and events using Tavily."""
    try:
        destination = state["destination"]
        interests = state["interests"]
        start_date = state["start_date"]
        
        activities = []
        for interest in interests[:3]:
            query = f"{interest} activities events {destination} 2024 things to do experiences"
            results = tavily_client.search(
                query=query,
                search_depth="basic",
                max_results=3
            )
            
            for result in results.get("results", []):
                activity = {
                    "title": result.get("title", ""),
                    "description": result.get("content", "")[:200],
                    "category": interest,
                    "url": result.get("url", ""),
                    "image_url": get_wikipedia_image(
                        f"{interest} {destination}",
                        tavily_client
                    )
                }
                activities.append(activity)
        
        return {
            "activities": activities[:8],
            "current_step": ["activities_complete"],
            "progress": 90,
        }
    except Exception as e:
        return {
            "activities": [],
            "error_messages": [f"Activities error: {str(e)}"],
        }
