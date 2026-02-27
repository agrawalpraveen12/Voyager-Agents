"""Research agent for destination information."""
import json
from typing import Dict, Any, Optional
from langchain_community.utilities import WikipediaAPIWrapper
from tavily import TavilyClient
import time


def get_wikipedia_image(query: str, tavily_client: TavilyClient, delay: float = 0.5) -> Optional[str]:
    """Fetch image URL from Tavily."""
    time.sleep(delay)
    
    try:
        result = tavily_client.search(
            query=query,
            search_depth="basic",
            include_images=True,
            max_results=1
        )
        
        if "images" in result and len(result["images"]) > 0:
            return result["images"][0]
    except Exception as e:
        print(f"Tavily image search error for '{query}': {e}")
    
    return None


async def research_agent(
    state: Dict[str, Any],
    llm,
    tavily_client: TavilyClient,
    wikipedia: WikipediaAPIWrapper
) -> Dict[str, Any]:
    """Research destination and get main image."""
    try:
        destination = state["destination"]
        
        # Get Wikipedia information
        wiki_result = wikipedia.run(f"{destination} travel tourism")
        
        # Get destination image
        destination_image = get_wikipedia_image(
            f"{destination} landmark",
            tavily_client
        )
        
        # Extract key info using LLM
        prompt = f"""
        Extract key travel information for a trip from {state.get('origin', 'unknown location')} to {destination}, based on this Wikipedia content about {destination}:
        {wiki_result[:2000]}
        
        Return a JSON with:
        - description: 2-sentence overview
        - best_time_to_visit: season/months
        - currency: local currency
        - language: main language(s)
        - timezone: timezone info
        - key_facts: 3 interesting facts as list
        """
        
        response = llm.invoke(prompt)
        content = getattr(response, "content", str(response))
        
        try:
            destination_info = json.loads(content.replace("```json", "").replace("```", ""))
        except:
            destination_info = {
                "description": content[:300],
                "raw_info": wiki_result[:500]
            }
        
        return {
            "destination_info": destination_info,
            "destination_image": destination_image,
            "current_step": ["research_complete"],
            "progress": 20,
        }
    except Exception as e:
        return {
            "destination_info": {"error": str(e)},
            "destination_image": None,
            "error_messages": [f"Research error: {str(e)}"],
        }
