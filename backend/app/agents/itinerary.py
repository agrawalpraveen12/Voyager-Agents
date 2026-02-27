"""Itinerary agent for generating final trip plan."""
import json
from typing import Dict, Any
from datetime import datetime


async def itinerary_agent(state: Dict[str, Any], llm) -> Dict[str, Any]:
    """Generate final comprehensive itinerary."""
    try:
        # Calculate trip duration
        start = datetime.strptime(state["start_date"], "%Y-%m-%d")
        end = datetime.strptime(state["end_date"], "%Y-%m-%d")
        duration = (end - start).days
        
        prompt = f"""
        Create a detailed {duration}-day trip itinerary for a journey from {state.get('origin', 'unknown')} to {state["destination"]}.
        
        TRIP DETAILS:
        - Origin: {state.get('origin', 'unknown')}
        - Destination: {state["destination"]}
        - Dates: {state["start_date"]} to {state["end_date"]} ({duration} days)
        - Budget: ₹{state["budget"]} for {state["num_travelers"]} travelers
        - Interests: {", ".join(state["interests"])}
        
        AVAILABLE DATA:
        
        Destination Info: {json.dumps(state.get("destination_info", {}))}
        
        Top Places: {json.dumps([p.get("name", "") + " (Rating: " + str(p.get("rating", "N/A")) + ")" for p in state.get("places_info", [])[:5]])}
        
        Transport Options:
        - Flights: {json.dumps(state.get("flight_options", []))}
        - Trains: {json.dumps(state.get("train_options", []))}
        - Buses: {json.dumps(state.get("bus_options", []))}
        
        Hotel Options: {json.dumps(state.get("hotel_options", []))}
        
        Activities Available: {json.dumps([a.get("title", "") + " - " + a.get("category", "") for a in state.get("activities", [])[:6]])}
        
        Weather: {json.dumps(state.get("weather_info", {}))}
        
        CREATE A COMPREHENSIVE ITINERARY WITH:
        
        ## 🗓️ TRIP OVERVIEW
        - Destination summary (show Rupees ₹)
        - Duration and dates
        - Budget breakdown in ₹
        
        ## 🚆 TRANSPORTATION & ARRIVAL
        - Recommended flight, train, or bus options (from the search results)
        - Highlight the most budget-friendly option
        - Local transport tips
        
        ## 🏨 ACCOMMODATION
        - Top 3 hotel recommendations (from search results with prices in ₹)
        - Area recommendations
        
        ## 📅 DAY-BY-DAY ITINERARY
        For each day, include:
        - Morning activity (specific place/attraction)
        - Afternoon activity
        - Evening suggestion
        - Estimated daily costs in ₹
        - Transportation tips
        
        ## 🎯 MUST-DO ACTIVITIES
        - Top attractions (from places found)
        - Experience recommendations
        - Booking tips
        
        ## 💰 FINAL BUDGET ESTIMATE (All in ₹)
        - Transport: estimated cost
        - Accommodation: per night cost
        - Activities & Food: daily budget
        - Total estimated cost per person
        
        ## 📋 PRACTICAL TIPS
        - Local customs in {state["destination"]}
        - Transportation advice
        - Safety tips
        - Emergency contacts
        
        Make it engaging, practical, and well-formatted with emojis and clear sections. Use ₹ symbol for all prices.
        """
        
        response = llm.invoke(prompt)
        content = getattr(response, "content", str(response))
        
        return {
            "final_itinerary": content,
            "current_step": ["complete"],
            "progress": 100,
        }
    except Exception as e:
        return {
            "final_itinerary": f"Error generating itinerary: {str(e)}",
            "error_messages": [f"Itinerary error: {str(e)}"],
        }
