# 🧪 Testing Guide: Voyager-Agents

This guide outlines the systematic approach for testing the **Voyager-Agents** platform. Testers should follow these scenarios to ensure the reliability of the multi-agent orchestration, data accuracy, and UI/UX integrity.

---

## 🛠️ Phase 1: Environment Verification

Before starting functional tests, ensure the following environment variables and services are active:

1.  **API Status**: 
    *   Verify `GOOGLE_API_KEY` (Gemini) is valid.
    *   Verify `TAVILY_API_KEY` is active (check usage limits).
2.  **Service Connectivity**:
    *   **Backend**: Ensure `http://localhost:8000/docs` is accessible.
    *   **Frontend**: Ensure `http://localhost:3000` is running.
3.  **Virtual Environment**: Confirm that `pip install -r requirements.txt` was successful and all dependencies are loaded.

---

## 🎯 Phase 2: Functional Test Scenarios

### 1. The "Happy Path" (Standard Trip)
*   **Input**: 
    *   Origin: Delhi
    *   Destination: Paris
    *   Dates: 5 days in the future
    *   Interests: Food, History
*   **Expected Result**:
    *   Loading state shows all agents completing their tasks.
    *   Hero image of Paris appears.
    *   Day-by-day itinerary is generated in Markdown.
    *   Flight, Hotel, and Activity cards are populated with images.

### 2. Edge Case: Ultra-Short & Ultra-Long Trips
*   **Scenario A**: Plan a 1-day trip.
    *   *Check*: Does the itinerary look too sparse or broken?
*   **Scenario B**: Plan a 14-day trip.
    *   *Check*: Does the agent successfully generate a full 2-week schedule without timing out?

### 3. Budget Constraints
*   **Scenario A**: Budget = 10,000 INR (Low).
    *   *Check*: Does the Hotel agent suggest hostels or budget stays?
*   **Scenario B**: Budget = 5,000,000 INR (High).
    *   *Check*: Does the agent suggest luxury 5-star hotels and private experiences?

### 4. Niche Interest Validation
*   **Input**: "Quantum Physics" or "Ancient Pottery" as interests.
*   **Expected Result**: The Activities agent should search for specific museums, labs, or workshops related to these niche topics instead of generic tourist spots.

---

## 🎨 Phase 3: UI/UX & Dark Mode Testing

1.  **Theme Consistency**:
    *   Verify that no white "flashes" occur during navigation.
    *   Ensure all text is readable (high contrast) against the slate-900 background.
2.  **Responsiveness**:
    *   Test the `TripForm` on a mobile view (Chrome DevTools).
    *   Ensure the `ItineraryDisplay` cards stack correctly on smaller screens.
3.  **Loading State UX**:
    *   Verify the progress bar moves as agents finish.
    *   Ensure the "Agent Collaboration" messages are visible and correctly styled.

---

## ⚡ Phase 4: Integration & Error Handling

1.  **Backend Down**: Stop the FastAPI server and try to plan a trip.
    *   **Expected**: A clear "Planning Encountered a Hiccup" error message should appear in the UI.
2.  **Invalid Destination**: Enter "Mars" or "Atlantis" as a destination.
    *   **Expected**: The system should either return a creative fallback or a polite "Destination not found" error.
3.  **PDF Generation**: Click "Download PDF" after an itinerary is generated.
    *   **Expected**: A clean PDF should download with the correct itinerary content.
4.  **Wikipedia Fallback**: Test a very obscure village in India.
    *   **Expected**: Ensure the `Research Agent` uses Tavily if Wikipedia doesn't have a direct entry.

---

## 📝 Reporting Bugs

When reporting an issue, please include:
1.  **Input Data**: The exact origin, destination, and interests used.
2.  **Logs**: Any error output from the Python terminal (Backend) or Browser console (Frontend).
3.  **Screenshots**: A visual of the broken component or error message.

---

*Happy Testing! Let's make Voyager-Agents bulletproof.* 🚀
