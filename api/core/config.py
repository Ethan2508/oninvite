"""
Configuration de l'application
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Base de données
    database_url: str = "postgresql://eventapp:devpassword@localhost:5432/eventapp"
    
    # Firebase
    firebase_credentials: str = ""
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    
    # Cloudinary
    cloudinary_url: str = ""
    
    # App
    debug: bool = True
    api_base_url: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"


settings = Settings()
