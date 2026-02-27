"""Hotels agent for searching hotel options."""
import json
from typing import Dict, Any
from tavily import TavilyClient


async def hotels_agent(
    state: Dict[str, Any],
    llm,
    tavily_client: TavilyClient
) -> Dict[str, Any]:
    """Search hotels using Tavily."""
    try:
        destination = state["destination"]
        budget = state["budget"]
        
        # Search for hotel information
        hotel_query = f"best hotels {destination} accommodation booking prices reviews {budget} budget"
        hotel_results = tavily_client.search(
            query=hotel_query,
            search_depth="advanced",
            max_results=6
        )
        
        # Extract structured hotel data
        prompt = f"""
        From these hotel search results for {destination}:
        {json.dumps([r.get('title', '') + ' - ' + r.get('content', '')[:150] for r in hotel_results.get('results', [])])}
        
        Extract 3-5 hotel options as JSON array:
        [
          {{
            "name": "hotel name",
            "price_per_night": "price per night",
            "rating": "star rating or review score",
            "location": "area/neighborhood",
            "amenities": "key amenities",
            "booking_platform": "where to book"
          }}
        ]
        """
        
        hotel_response = llm.invoke(prompt)
        hotel_content = getattr(hotel_response, "content", str(hotel_response))
        
        try:
            hotel_options = json.loads(hotel_content.replace("```json", "").replace("```", ""))
            if not isinstance(hotel_options, list):
                hotel_options = []
        except:
            hotel_options = []
        
        return {
            "hotel_options": hotel_options,
            "current_step": ["hotels_complete"],
        }
        
    except Exception as e:
        return {
            "hotel_options": [],
            "error_messages": [f"Hotel search error: {str(e)}"]
        }
