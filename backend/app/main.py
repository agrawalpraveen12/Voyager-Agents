"""FastAPI application main file."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routers import trip_router, booking_router
from app.models import HealthResponse


import os
os.environ["GOOGLE_API_VERSION"] = "v1"

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("🚀 Starting AI Trip Planner API...")
    print(f"📍 Environment: {settings.environment}")
    
    # Check API keys
    api_status = []
    if settings.groq_api_key: api_status.append("Groq ✓")
    if settings.tavily_api_key: api_status.append("Tavily ✓")
    if settings.resend_api_key: api_status.append("Resend ✓")
    if settings.twilio_account_sid: api_status.append("Twilio ✓")
    
    print(f"🔑 API Keys configured: {', '.join(api_status)}")
    print(f"📦 Redis: {settings.redis_url}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down AI Trip Planner API...")


# Create FastAPI app
app = FastAPI(
    title="AI Trip Planner API",
    description="Multi-agent AI trip planning service powered by LangGraph",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],  # In production, remove "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(trip_router, prefix="/api/v1")
app.include_router(booking_router, prefix="/api/v1")


@app.get("/", response_model=dict)
async def root():
    """Root endpoint."""
    return {
        "message": "AI Trip Planner API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/trip/health"
    }


@app.get("/api/v1/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.environment == "development"
    )
