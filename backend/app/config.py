"""Configuration management for the application."""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    groq_api_key: str
    tavily_api_key: str
    
    # Email Configuration (Resend)
    resend_api_key: str
    from_email: str = "onboarding@resend.dev"
    
    # Twilio Configuration (SMS, Phone & WhatsApp)
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str
    twilio_whatsapp_number: str = "whatsapp:+14155238886"
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_ttl: int = 3600
    
    # Feature Flags
    enable_phone_confirmation: bool = True
    enable_whatsapp_confirmation: bool = True
    enable_email_notifications: bool = True
    enable_auto_booking: bool = False
    
    # Timing
    voice_call_delay_seconds: int = 120
    confirmation_expiry_hours: int = 24
    
    # URLs
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    
    # Backend Configuration
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    api_version: str = "v1"
    
    # Environment
    environment: str = "development"
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        # Look for .env in current dir and parent dir
        env_file = [".env", "../.env"]
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
