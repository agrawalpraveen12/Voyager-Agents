"""Flights agent for searching flight options."""
import json
from typing import Dict, Any
from tavily import TavilyClient


async def flights_agent(
    state: Dict[str, Any],
    llm,
    tavily_client: TavilyClient
) -> Dict[str, Any]:
    """Search flights using Tavily."""
    try:
        destination = state["destination"]
        start_date = state["start_date"]
        origin = state.get("origin", "major cities")
        
        # Search for flight information
        flight_query = f"flights to {destination} from {origin} {start_date} prices airlines booking"
        flight_results = tavily_client.search(
            query=flight_query,
            search_depth="advanced",
            max_results=6
        )
        
        # Extract structured flight data
        flight_prompt = f"""
        From these flight search results for {destination}:
        {json.dumps([r.get('title', '') + ' - ' + r.get('content', '')[:150] for r in flight_results.get('results', [])])}
        
        Extract 3-5 flight options as JSON array:
        [
          {{
            "airline": "airline name",
            "price": "price range or specific price",
            "duration": "flight duration",
            "stops": "direct/1-stop/2-stop",
            "departure": "departure info",
            "booking_tip": "where/how to book"
          }}
        ]
        """
        
        flight_response = llm.invoke(flight_prompt)
        flight_content = getattr(flight_response, "content", str(flight_response))
        
        try:
            flight_options = json.loads(flight_content.replace("```json", "").replace("```", ""))
            if not isinstance(flight_options, list):
                flight_options = []
        except:
            flight_options = []
        
        return {
            "flight_options": flight_options,
            "current_step": ["flights_complete"],
        }
    except Exception as e:
        return {
            "flight_options": [],
            "error_messages": [f"Flight search error: {str(e)}"]
        }
