# 🌍 Voyager-Agents: Multi-Agent AI Travel Orchestrator

Voyager-Agents is a state-of-the-art **Autonomous Travel Planning System** that leverages a multi-agent architecture to research, plan, and curate high-fidelity travel itineraries. Unlike simple LLM wrappers, Voyager-Agents employs **LangGraph** to coordinate a team of specialized AI agents, each dedicated to a specific domain of travel logistics.

---

## 📸 UI Showcase

### 🏠 Home Dashboard
<img src="screenshots/home.png" width="800" alt="Home Screen" />

---

### 📝 Smart Planning Form
<img src="screenshots/form.png" width="800" alt="Form Screen" />

---

### 📅 AI-Generated Itinerary
<img src="screenshots/itinerary.png" width="800" alt="Itinerary Screen" />

---

## 🧠 The Concept: Why Multi-Agent?

Traditional travel planners often provide generic advice or require manual research across dozens of websites. Voyager-Agents solves this by simulating a professional travel agency where specialized "experts" work in parallel:
1.  **Parallel Execution**: While one agent researches hotels, another looks up flight prices and a third checks the local weather forecast.
2.  **State Management**: LangGraph ensures that all agents share a unified "Trip State," allowing them to build upon each other's findings.
3.  **Real-Time Data**: By integrating with Tavily and Wikipedia, the agents access live web data rather than relying solely on the LLM's training data.

---

## 🏗️ Technical Architecture & Agent Roles

The system is built on a modular "Graph" architecture. Each node in the graph represents a specialized AI agent:

### 1. 🔍 The Research Agent
*   **Role**: The "Scout."
*   **Action**: Performs deep-dive searches on the destination.
*   **Output**: Cultural context, local customs, best time to visit, and a high-resolution hero image of the city.

### 2. 🏛️ The Places Agent
*   **Role**: The "Local Guide."
*   **Action**: Identifies top-rated attractions and landmarks.
*   **Output**: A list of must-visit spots with ratings, images, and descriptions.

### 3. ✈️ The Logistics Team (Parallel)
*   **Flights Agent**: Researches real-time flight options, airlines, and estimated costs from the user's origin.
*   **Hotels Agent**: Finds premium accommodation options that match the user's budget and interests.
*   **Weather Agent**: Provides a multi-day forecast to ensure the itinerary matches the climate.

### 4. 🎭 The Activities Agent
*   **Role**: The "Experience Curator."
*   **Action**: Cross-references user interests (e.g., "Foodie," "Adventure," "History") with the destination's offerings.
*   **Output**: A curated list of unique experiences and events.

### 5. ✍️ The Itinerary Agent
*   **Role**: The "Lead Orchestrator."
*   **Action**: Synthesizes all data from previous agents into a cohesive, day-by-day Markdown itinerary.
*   **Output**: A professional report including travel tips, daily schedules, and logistics.

---

## 🛠️ Modern Tech Stack

*   **Orchestration**: **LangGraph** (by LangChain) for managing the complex state machine of AI agents.
*   **Brain**: **Google Gemini 2.5 Flash** for high-speed, high-context reasoning.
*   **Backend**: **FastAPI** (Python) for an asynchronous, high-performance API layer.
*   **Frontend**: **Next.js 14** with **Tailwind CSS** for a premium, dark-mode user experience.
*   **Search**: **Tavily AI** (Search-as-a-Service) optimized specifically for LLM retrieval.
*   **Intelligence**: **Wikipedia API** for rich cultural and historical background.

---

## 🔄 The End-to-End Workflow

1.  **User Input**: User provides origin, destination, dates, budget, and interests.
2.  **Graph Initialization**: The LangGraph starts with the `Research Agent`.
3.  **Parallel Lookups**: Once the destination is verified, the Logistics Team (Flights, Hotels, Weather) runs simultaneously to save time.
4.  **Synthesis**: The `Itinerary Agent` takes the massive amount of collected data and distills it into a human-readable format.
5.  **Multi-Format Export**: The final plan is displayed in the UI and can be exported as a professional PDF.

---

## 🚀 Getting Started

### Backend Setup
1.  Clone the repository.
2.  Create a virtual environment: `python -m venv myenv`.
3.  Install dependencies: `pip install -r requirements.txt`.
4.  Set up your `.env` with `GOOGLE_API_KEY` and `TAVILY_API_KEY`.
5.  Run: `python -m uvicorn app.main:app --reload`.

### Frontend Setup
1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Run: `npm run dev`.

---

## 🧪 Quality Assurance

To ensure the platform's reliability, we have provided a detailed testing manual. If you are a contributor or a tester, please refer to the:

👉 **[Voyager-Agents Testing Guide](./TESTING.md)**

---

🤖 **Voyager-Agents** — *Redefining how the world plans its adventures.*

---

## 🗺️ Roadmap & Future Enhancements

We are actively working on expanding Voyager-Agents beyond research and planning. Our upcoming milestones include:

### 📱 1. Omnichannel Communication
- **WhatsApp Integration**: Receive your final itinerary directly on WhatsApp.
- **Twilio SMS**: Status updates and emergency contact details sent via SMS.
- **Real-time Notifications**: Instant alerts for flight changes or weather warnings during your trip.

### 💳 2. Real-Time Booking Engine
- **Direct Bookings**: Integration with Amadeus or Skyscanner APIs to book flights and hotels directly through the app.
- **Secure Payments**: Specialized Payment Agent to handle secure transaction workflows.

### 💰 3. Budget-Friendly Intelligence
- **Cost Optimizer Agent**: A dedicated agent to scan for the best deals and suggest cheaper alternatives (e.g., hostels vs. hotels, public transport vs. cabs).
- **Expense Tracking**: Live tracking of trip expenses against the set budget.

### 🌍 4. Advanced Personalization
- **Multi-Language Support**: Itineraries generated in the user's native language.
- **Community Templates**: Share and discover successful itineraries from other travelers.

---

## 📜 License
This project is licensed under the MIT License.

## ✨ Credits
Built with ❤️ using [LangGraph](https://github.com/langchain-ai/langgraph) and [Google Gemini](https://ai.google.dev/).
