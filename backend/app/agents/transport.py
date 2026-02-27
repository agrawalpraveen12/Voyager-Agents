"""Transport agent for searching flights, trains, and buses."""
import json
from typing import Dict, Any
from tavily import TavilyClient


async def transport_agent(
    state: Dict[str, Any],
    llm,
    tavily_client: TavilyClient
) -> Dict[str, Any]:
    """Search for all transport options: flights, trains, and buses."""
    try:
        destination = state["destination"]
        start_date = state["start_date"]
        origin = state.get("origin", "major cities")
        budget = state.get("budget", 5000)
        
        # Search for all transport options with focus on small city connectivity
        transport_query = f"""
        travel from {origin} to {destination} India {start_date}
        flights trains buses prices booking
        IRCTC Indian Railways state transport buses
        RedBus APSRTC GSRTC MSRTC private buses
        small cities towns connectivity
        budget-friendly affordable transport options
        """
        
        transport_results = tavily_client.search(
            query=transport_query,
            search_depth="advanced",
            max_results=12
        )
        
        # Extract structured transport data
        transport_prompt = f"""
        From these transport search results for travel from {origin} to {destination} in India:
        {json.dumps([r.get('title', '') + ' - ' + r.get('content', '')[:200] for r in transport_results.get('results', [])])}
        
        Budget: ₹{budget}
        
        IMPORTANT: Focus on connectivity to small cities and towns across India.
        Include options from Indian Railways, state transport corporations, and private operators.
        
        Extract transport options as JSON with THREE categories:
        {{
          "flights": [
            {{
              "airline": "IndiGo/Air India/SpiceJet etc",
              "price": "₹X,XXX",
              "duration": "Xh XXm",
              "stops": "direct/1-stop",
              "departure": "time",
              "booking_tip": "MakeMyTrip/Cleartrip/Direct"
            }}
          ],
          "trains": [
            {{
              "train_name": "train name/number (e.g., Rajdhani/Shatabdi/Express)",
              "class": "3AC/2AC/Sleeper/General",
              "price": "₹XXX",
              "duration": "Xh XXm",
              "departure": "station and time",
              "booking_tip": "IRCTC/ConfirmTkt - connects small cities",
              "route_info": "via major stations"
            }}
          ],
          "buses": [
            {{
              "operator": "APSRTC/GSRTC/MSRTC/RedBus/Private",
              "type": "AC Sleeper/AC Seater/Non-AC/Volvo",
              "price": "₹XXX",
              "duration": "Xh XXm",
              "departure": "bus stand and time",
              "booking_tip": "RedBus/State Transport website",
              "route_info": "connects small towns en route"
            }}
          ]
        }}
        
        Provide 3-4 options for each category, prioritizing:
        1. Budget-friendly options (especially trains and buses)
        2. Options that connect small cities and towns
        3. Indian transport operators (IRCTC, State Transport, RedBus)
        4. Realistic prices in Indian Rupees (₹)
        
        If no data available for a category, return empty array.
        """
        
        transport_response = llm.invoke(transport_prompt)
        transport_content = getattr(transport_response, "content", str(transport_response))
        
        try:
            transport_data = json.loads(transport_content.replace("```json", "").replace("```", "").strip())
            if not isinstance(transport_data, dict):
                transport_data = {"flights": [], "trains": [], "buses": []}
        except:
            transport_data = {"flights": [], "trains": [], "buses": []}
        
        return {
            "flight_options": transport_data.get("flights", []),
            "train_options": transport_data.get("trains", []),
            "bus_options": transport_data.get("buses", []),
            "current_step": ["transport_complete"],
        }
    except Exception as e:
        return {
            "flight_options": [],
            "train_options": [],
            "bus_options": [],
            "error_messages": [f"Transport search error: {str(e)}"]
        }
