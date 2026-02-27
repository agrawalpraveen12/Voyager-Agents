"""Places agent for finding tourist attractions."""
from typing import Dict, Any
from tavily import TavilyClient
from .research import get_wikipedia_image


async def places_agent(
    state: Dict[str, Any],
    tavily_client: TavilyClient
) -> Dict[str, Any]:
    """Agent to fetch top places using Tavily."""
    try:
        destination = state["destination"]
        
        places_query = f"top tourist attractions in {destination}"
        places_result = tavily_client.search(
            query=places_query,
            search_depth="basic",
            max_results=6
        )
        
        places_info = []
        for r in places_result.get("results", [])[:6]:
            place_details = {
                "name": r.get("title", ""),
                "rating": None,
                "address": "",
                "types": [],
                "place_id": None,
                "image_url": None
            }
            
            # Get image from Tavily
            place_image = get_wikipedia_image(
                f"{r.get('title', '')} {destination}",
                tavily_client
            )
            place_details["image_url"] = place_image
            
            places_info.append(place_details)
        
        return {
            "places_info": places_info,
            "current_step": ["places_complete"],
            "progress": 40
        }
    
    except Exception as e:
        return {
            "places_info": [],
            "error_messages": [f"Places error: {str(e)}"]
        }
